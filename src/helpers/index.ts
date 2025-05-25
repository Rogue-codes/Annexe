import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.TOKEN_SECRET_KEY;
const algorithm = 'aes-256-cbc';

export function genToken(): string {
  const token = (Math.floor(Math.random() * 900000) + 100000).toString();
  return token;
}

export function encryptToken(token: string): string {
  const key = Buffer.from(secretKey?.padEnd(32).slice(0, 32), 'utf8'); // Ensure key is 32 bytes
  const iv = crypto.randomBytes(16); // 16 bytes IV

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encryptedToken = cipher.update(token, 'utf8', 'hex');
  encryptedToken += cipher.final('hex');

  return `${iv.toString('hex')}:${encryptedToken}`;
}

export function decryptToken(encryptedData: string): string {
  const [ivHex, encryptedToken] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(secretKey.padEnd(32).slice(0, 32), 'utf8');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decryptedToken = decipher.update(encryptedToken, 'hex', 'utf8');
  decryptedToken += decipher.final('utf8');

  return decryptedToken;
}


export function genRandomStr(): string {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomStr = "";

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomStr += char[randomIndex]; 
  }

  return randomStr;
}

