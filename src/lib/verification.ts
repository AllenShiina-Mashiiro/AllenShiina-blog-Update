import { createHmac, randomInt } from "node:crypto";
export function createVerificationCode() { return randomInt(0, 1_000_000).toString().padStart(6, "0"); }
export function hashVerificationCode(email: string, purpose: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(`${email.toLowerCase()}:${purpose}:${code}`).digest("hex");
}
