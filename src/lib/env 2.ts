const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export { MONGODB_URI, JWT_SECRET };
