import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./env";

export type AuthTokenPayload = JwtPayload & {
  sub: string;
  name?: string;
  email?: string;
  role?: "admin" | "editor";
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    return decoded as AuthTokenPayload;
  } catch {
    return null;
  }
}
