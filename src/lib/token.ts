import crypto from 'crypto';

const PREFIX = 'CSTv2';

export interface CipherPayload {
    id: string;
    email: string;
    issuedAt: number;
    expiresAt: number;
    [key: string]: any;
}

export class CipherToken {
    private ENC_KEY_SECRET: Buffer;
    private CIPHER_KEY_SECRET: Buffer;

    constructor(encKeyHex: string, mazeKeyHex: string) {
        this.ENC_KEY_SECRET = Buffer.from(encKeyHex, 'hex');
        this.CIPHER_KEY_SECRET = Buffer.from(mazeKeyHex, 'hex');
    }

    private deriveLayerKey(seed: Buffer, salt: string): Buffer {
        return crypto.pbkdf2Sync(seed, salt, 100000, 32, 'sha512');
    }

    /**
     * Encrypts a payload using three encryption layers with unique salts and IVs.
     * Layers:
     *  - Key1: derived from ENC_KEY_SECRET
     *  - Key2: derived from MAZE_KEY
     *  - Key3: derived from both (adds cross entropy)
     * Output: Base64 string prefixed with version tag.
     */
    encrypt = (payload: CipherPayload): string => {
        const base = Buffer.from(JSON.stringify(payload), 'utf8');

        const salt1 = crypto.randomBytes(16); // for ENC_KEY_SECRET
        const salt2 = crypto.randomBytes(16); // for MAZE_KEY
        const salt3 = crypto.randomBytes(16); // for ENC_KEY_SECRET 

        const key1 = this.deriveLayerKey(this.ENC_KEY_SECRET, salt1.toString('hex'));
        const key2 = this.deriveLayerKey(this.CIPHER_KEY_SECRET, salt2.toString('hex'));
        const key3 = this.deriveLayerKey(Buffer.concat([this.ENC_KEY_SECRET, this.CIPHER_KEY_SECRET]), salt3.toString('hex'));

        // Reduce through 3 encryption layers
        const encrypted = [key1, key2, key3].reduce((data, key) => {
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            const encryptedBuf = Buffer.concat([cipher.update(data), cipher.final()]);
            const tag = cipher.getAuthTag();
            return Buffer.concat([iv, tag, encryptedBuf]);
        }, base);

        const combined = Buffer.concat([salt1, salt2, salt3, encrypted]);
        return PREFIX + '.' + combined.toString('base64');
    };

    /**
     * Decrypts a token that was previously encrypted by this class.
     * Uses the same salts to reconstruct keys, then reverses the encryption process.
     * Ensures data integrity using AES-GCM authentication tag per layer.
     */
    decrypt = (token: string): CipherPayload => {
        if (!token.startsWith(PREFIX + '.')) throw new Error('Invalid MazeToken prefix');

        const b64 = token.split('.')[1];
        const buffer = Buffer.from(b64, 'base64');

        const salt1 = buffer.subarray(0, 16);
        const salt2 = buffer.subarray(16, 32);
        const salt3 = buffer.subarray(32, 48);
        let encrypted = buffer.subarray(48);

        const keys = [
            this.deriveLayerKey(Buffer.concat([this.ENC_KEY_SECRET, this.CIPHER_KEY_SECRET]), salt3.toString('hex')),
            this.deriveLayerKey(this.CIPHER_KEY_SECRET, salt2.toString('hex')),
            this.deriveLayerKey(this.ENC_KEY_SECRET, salt1.toString('hex')),
        ];

        for (const key of keys) {
            const iv = encrypted.subarray(0, 12);
            const tag = encrypted.subarray(12, 28);
            const data = encrypted.subarray(28);

            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(tag);
            const result = Buffer.concat([decipher.update(data), decipher.final()]);
            encrypted = result;
        }

        return JSON.parse(encrypted.toString('utf8'));
    };
}