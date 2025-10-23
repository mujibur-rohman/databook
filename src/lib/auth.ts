import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// JWT utilities
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key"
);

export async function signToken(
  payload: Record<string, unknown>
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// User session utilities
export interface UserSession {
  id: number;
  username: string;
}

export function createUserSession(user: {
  id: number;
  username: string;
}): UserSession {
  return {
    id: user.id,
    username: user.username,
  };
}
