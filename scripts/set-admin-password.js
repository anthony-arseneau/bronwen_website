// Sets the admin login: npm run set-password
// Writes ADMIN_EMAIL and a hashed ADMIN_PASSWORD_HASH to .env (plus a SESSION_SECRET the first time).
// Other lines in .env are kept. Restart the server afterwards.
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { hashPassword } from '../auth.js';

const ENV_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
const MIN_PASSWORD_LENGTH = 12;

const lines = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/) : [];
const current = Object.fromEntries(lines
  .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/))
  .filter(Boolean)
  .map(([, key, value]) => [key, value]));

// Lines are queued because piped input can arrive before the next prompt is asked.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const queuedLines = [];
let waitingForLine = null;
let muted = false;
rl._writeToOutput = (text) => {
  if (!muted) rl.output.write(text);
};
rl.on('line', (line) => {
  if (waitingForLine) {
    const resolve = waitingForLine;
    waitingForLine = null;
    resolve(line);
  } else {
    queuedLines.push(line);
  }
});
rl.on('close', () => {
  if (waitingForLine) fail('No answer was given. Nothing was changed.');
});

const ask = (query, hidden = false) => new Promise((resolve) => {
  muted = false;
  rl.output.write(query);
  const finish = (answer) => {
    if (hidden) {
      muted = false;
      rl.output.write('\n');
    }
    resolve(answer);
  };
  if (queuedLines.length > 0) {
    finish(queuedLines.shift());
  } else {
    muted = hidden;
    waitingForLine = finish;
  }
});

function fail(message) {
  console.error(`\n${message}`);
  rl.close();
  process.exit(1);
};

const defaultEmail = current.ADMIN_EMAIL || '';
const email = (await ask(`Admin email${defaultEmail ? ` [${defaultEmail}]` : ''}: `)).trim() || defaultEmail;
if (!/^[^\s@]+@[^\s@]+$/.test(email)) fail('That does not look like an email address. Nothing was changed.');

const password = await ask(`New password (at least ${MIN_PASSWORD_LENGTH} characters, hidden): `, true);
if (password.length < MIN_PASSWORD_LENGTH) fail(`The password must be at least ${MIN_PASSWORD_LENGTH} characters. Nothing was changed.`);
if (await ask('Type it again: ', true) !== password) fail('The passwords did not match. Nothing was changed.');
rl.close();

const updates = {
  ADMIN_EMAIL: email,
  ADMIN_PASSWORD_HASH: await hashPassword(password),
  SESSION_SECRET: current.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  COOKIE_SECURE: current.COOKIE_SECURE || 'true',
};

const written = new Set();
const output = lines.map((line) => {
  const key = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1];
  if (!key || !(key in updates)) return line;
  written.add(key);
  return `${key}=${updates[key]}`;
});
while (output.length > 0 && output[output.length - 1] === '') output.pop();
Object.entries(updates)
  .filter(([key]) => !written.has(key))
  .forEach(([key, value]) => output.push(`${key}=${value}`));

fs.writeFileSync(ENV_FILE, `${output.join('\n')}\n`, { mode: 0o600 });
fs.chmodSync(ENV_FILE, 0o600);
console.log(`\nSaved the admin login for ${email} to .env.`);
console.log('Restart the server for it to take effect (e.g. pm2 restart bronwen-backend).');
