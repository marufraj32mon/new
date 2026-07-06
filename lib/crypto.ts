import crypto from "crypto";

function key() {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error("ENCRYPTION_KEY missing");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptText(plain: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptText(payload: string) {
  const [iv64, tag64, enc64] = payload.split(".");
  if (!iv64 || !tag64 || !enc64) throw new Error("Invalid encrypted payload");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv64, "base64"));
  decipher.setAuthTag(Buffer.from(tag64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(enc64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}
