const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const MONGODB_URI_SAFE: string = MONGODB_URI;
const JWT_SECRET_SAFE: string = JWT_SECRET;

export { MONGODB_URI_SAFE as MONGODB_URI, JWT_SECRET_SAFE as JWT_SECRET };
