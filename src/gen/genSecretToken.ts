import crypto from 'crypto';

const encKey = crypto.randomBytes(32).toString('hex');
const cipherKey = crypto.randomBytes(32).toString('hex');

console.log('ENC_KEY_SECRET:', encKey);
console.log('CIPHER_KEY_SECRET:', cipherKey);
