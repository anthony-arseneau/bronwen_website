import cors from 'cors';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  createSessionToken,
  isValidSessionToken,
  loadEnvFile,
  readCookie,
  verifyPassword,
} from './auth.js';
import { defaultGalleryCategories } from './src/data/galleryCategories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnvFile(path.join(__dirname, '.env'));

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const DATA_BACKUP_FILE = path.join(__dirname, 'data.json.bak');
const MAX_UPLOAD_STORAGE = 1 * 1024 * 1024 * 1024;
const UPLOAD_URL_PREFIX = '/api/uploads/';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const MAX_LOGIN_FAILURES = 10;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.warn('⚠️  Admin login is not set up, so nobody can edit the site. Run: npm run set-password');
}
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET is not set in .env, so admins are logged out whenever the server restarts.');
}

// Apache proxies from the same machine; trusting only loopback keeps req.ip the real visitor
// without letting direct callers spoof X-Forwarded-For.
app.set('trust proxy', 'loopback');

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://bronwen.anthonyarseneau.ca'],
  credentials: true
}));

app.use(express.json());

const isAdminRequest = (req) =>
  isValidSessionToken(readCookie(req, SESSION_COOKIE), SESSION_SECRET, ADMIN_PASSWORD_HASH);

const requireAdmin = (req, res, next) => {
  if (isAdminRequest(req)) return next();
  res.status(401).json({ error: 'Your login has expired. Please log in again.' });
};

const sessionCookieOptions = (req) => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: COOKIE_SECURE || req.secure,
  path: '/',
});

// Failed attempts per visitor IP, so the password can't be guessed by brute force.
const loginFailures = new Map();

app.post('/api/login', async (req, res, next) => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      return res.status(503).json({ error: 'Admin login is not set up on the server yet. Run "npm run set-password" there.' });
    }

    const now = Date.now();
    loginFailures.forEach((entry, ip) => {
      if (entry.resetAt <= now) loginFailures.delete(ip);
    });
    const failures = loginFailures.get(req.ip);
    if (failures && failures.count >= MAX_LOGIN_FAILURES) {
      return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    // Check the password even when the email is wrong, so response time doesn't reveal the email.
    const passwordMatches = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!passwordMatches || email !== ADMIN_EMAIL) {
      const entry = failures || { count: 0, resetAt: now + LOGIN_FAILURE_WINDOW_MS };
      entry.count += 1;
      loginFailures.set(req.ip, entry);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    loginFailures.delete(req.ip);
    res.cookie(SESSION_COOKIE, createSessionToken(SESSION_SECRET, ADMIN_PASSWORD_HASH), {
      ...sessionCookieOptions(req),
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions(req));
  res.json({ success: true });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: isAdminRequest(req) });
});

// API: Get Content
app.get('/api/content', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      // Content saved before gallery sections existed gets the default sections;
      // its items stay uncategorized until they are assigned in the editor.
      if (data.gallery && !Array.isArray(data.gallery.categories)) {
        data.gallery.categories = defaultGalleryCategories;
      }
      res.json(data);
    } else {
      res.status(404).json({ error: 'Content file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save Content
app.post('/api/content', requireAdmin, (req, res) => {
  try {
    const newContent = req.body;
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, DATA_BACKUP_FILE);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(newContent, null, 2));
    removeUnreferencedUploads(newContent);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from public folder
app.use('/api/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const getUploadFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getUploadFiles(entryPath) : [entryPath];
  });

const getUploadStorageBytes = () => getUploadFiles(uploadsDir)
  .reduce((total, filePath) => total + fs.statSync(filePath).size, 0);

const getReferencedUploadNames = (value, referencedNames = new Set()) => {
  if (typeof value === 'string' && value.startsWith(UPLOAD_URL_PREFIX)) {
    const filename = decodeURIComponent(value.slice(UPLOAD_URL_PREFIX.length));
    if (filename && !filename.includes('/') && !filename.includes('\\')) {
      referencedNames.add(filename);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => getReferencedUploadNames(item, referencedNames));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => getReferencedUploadNames(item, referencedNames));
  }
  return referencedNames;
};

const removeUnreferencedUploads = (content) => {
  const referencedNames = getReferencedUploadNames(content);
  getUploadFiles(uploadsDir).forEach((filePath) => {
    const filename = path.basename(filePath);
    if (!filename.startsWith('.') && !referencedNames.has(filename)) {
      fs.unlinkSync(filePath);
    }
  });
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** unitIndex)).toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

// Keep uploads in memory until Sharp has compressed them and the quota is checked.
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const compressImage = (buffer) => sharp(buffer)
  .rotate()
  .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();

const saveCompressedImage = async (compressed) => {
  const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
  await fs.promises.writeFile(path.join(uploadsDir, filename), compressed);
  return { filename, buffer: compressed };
};

const rejectIfOverStorageLimit = (additionalBytes) => {
  const currentBytes = getUploadStorageBytes();
  if (currentBytes + additionalBytes > MAX_UPLOAD_STORAGE) {
    const error = new Error('Upload rejected: storage limit reached (1GB)');
    error.statusCode = 413;
    throw error;
  }
};

// Report usage so administrators can see the cap before an upload is rejected.
app.get('/api/uploads/usage', requireAdmin, (req, res) => {
  try {
    const usedBytes = getUploadStorageBytes();
    res.json({
      usedBytes,
      limitBytes: MAX_UPLOAD_STORAGE,
      used: formatBytes(usedBytes),
      limit: formatBytes(MAX_UPLOAD_STORAGE),
      percentage: (usedBytes / MAX_UPLOAD_STORAGE) * 100,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload single image
app.post('/api/upload', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const compressed = await compressImage(req.file.buffer);
    rejectIfOverStorageLimit(compressed.length);
    const savedImage = await saveCompressedImage(compressed);

    // Use relative URL so it works on any domain
    const imageUrl = `/api/uploads/${savedImage.filename}`;
    
    res.json({
      success: true,
      filename: savedImage.filename,
      url: imageUrl,
      originalName: req.file.originalname,
      sizeBytes: savedImage.buffer.length,
    });
  } catch (error) {
    next(error);
  }
});

// Upload multiple images
app.post('/api/upload-multiple', requireAdmin, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const compressedImages = await Promise.all(req.files.map(async (file) => ({
      file,
      savedImage: await compressImage(file.buffer),
    })));
    rejectIfOverStorageLimit(compressedImages.reduce((total, image) => total + image.savedImage.length, 0));

    const uploadedFiles = await Promise.all(compressedImages.map(async ({ file, savedImage }) => {
      const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), savedImage);
      return {
        filename,
        url: `/api/uploads/${filename}`,
        originalName: file.originalname,
        sizeBytes: savedImage.length,
      };
    }));
    
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    next(error);
  }
});

// Delete an image
app.delete('/api/upload/:filename', requireAdmin, (req, res) => {
  try {
    // basename keeps an encoded "../" from reaching files outside the uploads folder.
    const filepath = path.join(uploadsDir, path.basename(req.params.filename));
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true, message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all uploaded images
app.get('/api/uploads', requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `/api/uploads/${file}`
      }));
    
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(error.statusCode || 500).json({ error: error.message });
});

// Serve frontend in production (MUST be after all API routes)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🖼️  Image upload server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads stored in: ${uploadsDir}`);
});
