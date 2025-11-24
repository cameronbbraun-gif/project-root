// src/lib/mongodb.js
import { MongoClient, MongoServerSelectionError } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI; // For Atlas this should start with mongodb+srv://
const dbName = process.env.MONGODB_DB || 'detailgeeks_db';

if (!uri) {
  throw new Error('MONGODB_URI is not set in environment');
}

const isSrv = uri.startsWith('mongodb+srv://');

// Let the driver negotiate TLS for SRV (Atlas). Do NOT override with tls/direct flags here.
const client = new MongoClient(uri, {
  // A short, reasonable connect timeout
  connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 20000),
  // For Atlas, it's fine (and recommended) to set the Stable API
  serverApi: { version: '1', strict: false, deprecationErrors: true },
});

// Hot-reload safety in dev
let clientPromise;
if (process.env.NODE_ENV === 'development') {
  if (!globalThis._atlasClientPromise) {
    globalThis._atlasClientPromise = client.connect().catch((err) => {
      // Make the error very explicit when it happens during startup
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
    // Augment common misconfigurations with friendlier hints
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