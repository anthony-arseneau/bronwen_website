// Admin authentication helpers shared by server.js and scripts/set-admin-password.js.
// Uses only Node's crypto module, so there is nothing native to compile on the server.
import crypto from 'crypto';
import fs from 'fs';

export const SESSION_COOKIE = 'bronwen_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;

const scrypt = (password, salt, cost, blockSize, parallelization) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, KEY_LENGTH, {
    N: cost,
    r: blockSize,
    p: parallelization,
  }, (error, key) => (error ? reject(error) : resolve(key)));
});

// Reads KEY=value lines into process.env without overriding variables that are already set.
export const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
    }
  });
};

// Stored as scrypt:N:r:p:salt:hash so the cost can be raised later without breaking old hashes.
export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT_COST, SCRYPT_BLOCK_SIZE, SCRYPT_PARALLELIZATION);
  return ['scrypt', SCRYPT_COST, SCRYPT_BLOCK_SIZE, SCRYPT_PARALLELIZATION, salt.toString('base64url'), key.toString('base64url')].join(':');
};

export const verifyPassword = async (password, storedHash) => {
  const [scheme, cost, blockSize, parallelization, salt, hash] = (storedHash || '').split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = await scrypt(password, Buffer.from(salt, 'base64url'), Number(cost), Number(blockSize), Number(parallelization));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const sign = (value, secret) => crypto.createHmac('sha256', secret).update(value).digest('base64url');

// The signature covers the password hash, so changing the password logs out every session.
export const createSessionToken = (secret, passwordHash) => {
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  return `${expiresAt}.${sign(`${expiresAt}.${passwordHash}`, secret)}`;
};

export const isValidSessionToken = (token, secret, passwordHash) => {
  if (!token || !passwordHash) return false;
  const [expiresAt, signature] = token.split('.');
  if (!signature || !(Number(expiresAt) > Date.now())) return false;
  const expected = Buffer.from(sign(`${expiresAt}.${passwordHash}`, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

export const readCookie = (req, name) => {
  const cookies = (req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
};
