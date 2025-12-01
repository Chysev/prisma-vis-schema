import "../utils/env"
import crypto from "crypto";

const IV_LENGTH = 16;

const encrypt = (value: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.API_KEY_SECRET, "hex"), iv);

    let encrypted = cipher.update(value, "utf8", "base64");
    encrypted += cipher.final("base64");

    const payload = {
        iv: iv.toString("base64"),
        data: encrypted,
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
}


const encrypted = encrypt("Hi");

console.log("Encrypted:", encrypted);

