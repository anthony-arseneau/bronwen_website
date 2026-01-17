import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://bronwen.anthonyarseneau.ca'],
  credentials: true
}));

app.use(express.json());

// API: Get Content
app.get('/api/content', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'Content file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save Content
app.post('/api/content', (req, res) => {
  try {
    const newContent = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newContent, null, 2));
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

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Handle SPA routing - return index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

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

// Upload single image
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Replace the hardcoded localhost with the public domain
    const imageUrl = `https://bronwen.anthonyarseneau.ca/api/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: imageUrl,
      originalName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      url: `http://localhost:${PORT}/uploads/${file.filename}`,
      originalName: file.originalname
    }));
    
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an image
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadsDir, req.params.filename);
    
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
app.get('/api/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `http://localhost:${PORT}/uploads/${file}`
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
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🖼️  Image upload server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads stored in: ${uploadsDir}`);
});
