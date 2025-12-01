import appConfig from "@/config";
import crypto from "crypto";

export const decryptKey = (token: string): string | null => {
    try {
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const { iv, data } = JSON.parse(decoded);

        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(appConfig.API_KEY_SECRET, "hex"),
            Buffer.from(iv, "base64")
        );

        let decrypted = decipher.update(data, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch {
        return null;
    }
}
