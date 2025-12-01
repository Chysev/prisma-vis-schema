import "../utils/env"
import crypto from "crypto";

export function genKey(secret: string): Buffer {
    if (!secret) throw new Error("API_KEY_SECRET missing");

    const isHex = /^[0-9a-fA-F]+$/.test(secret) && secret.length % 2 === 0;
    const isB64 = /^[A-Za-z0-9+/_-]+={0,2}$/.test(secret) && secret.length >= 44;

    if (isHex) {
        const key = Buffer.from(secret, "hex");
        if (key.length !== 32) throw new Error(`API_KEY_SECRET (hex) decoded to ${key.length} bytes; need 32`);
        return key;
    }

    if (isB64) {
        const key = Buffer.from(secret.replace(/-/g, "+").replace(/_/g, "/"), "base64");
        if (key.length !== 32) throw new Error(`API_KEY_SECRET (base64) decoded to ${key.length} bytes; need 32`);
        return key;
    }

    return crypto.scryptSync(secret, "static-salt-dev", 32);
}


const buf = genKey("01f55918785981b25887e765390bbefe3e2285d9270cefc977dd4d01e513fba5");
console.log("key(hex):  ", buf.toString("hex"));
