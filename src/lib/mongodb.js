import { MongoClient, MongoServerSelectionError } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'detailgeeks_db';

if (!uri) {
  throw new Error('MONGODB_URI is not set in environment');
}

const isSrv = uri.startsWith('mongodb+srv://');

const client = new MongoClient(uri, {
  connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 20000),
  serverApi: { version: '1', strict: false, deprecationErrors: true },
});

let clientPromise;
if (process.env.NODE_ENV === 'development') {
  if (!globalThis._atlasClientPromise) {
    globalThis._atlasClientPromise = client.connect().catch((err) => {
      const msg = `[mongo] connect failed: ${err?.message || err}`;
      console.error(msg);
      throw err;
    });
  }
  clientPromise = globalThis._atlasClientPromise;
} else {
  clientPromise = client.connect();
}

export async function getDb() {
  try {
    const conn = await clientPromise;
    return conn.db(dbName);
  } catch (err) {
    const e = err;
    const raw = e?.message || String(e);
    if (e instanceof MongoServerSelectionError || /SSL|TLS|handshake|certificate/i.test(raw)) {
      const hint = isSrv
        ? '\n[hint] Using Atlas SRV. Ensure: 1) Your IP is allow-listed in Atlas Network Access; 2) Username/password are correct; 3) No corporate proxy/SSL interception is breaking TLS.'
        : '\n[hint] Not SRV. Consider switching to your Atlas SRV URI (mongodb+srv://...).';
      console.error('[mongo] server selection error:', raw, hint);
    }
    throw err;
  }
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { serverApi: { version: '1' } });
      console.log('[mongo] Mongoose connected');
    }
  } catch (error) {
    console.error('[mongo] Mongoose connection error:', error?.message || error);
  }
};

export default clientPromise;