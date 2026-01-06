const DEFAULT_DB_NAME = 'detailgeeks_db';

let cachedUri = '';

let clientPromise;
let mongoServerSelectionErrorClass;

function getMongoUri() {
  return process.env.MONGODB_URI || '';
}

function getDbName() {
  return process.env.MONGODB_DB || DEFAULT_DB_NAME;
}

async function getClientPromise() {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  cachedUri = uri;

  const { MongoClient, MongoServerSelectionError } = await import('mongodb');
  mongoServerSelectionErrorClass = MongoServerSelectionError;

  const client = new MongoClient(uri, {
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 20000),
    serverApi: { version: '1', strict: false, deprecationErrors: true },
  });

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

  return clientPromise;
}

export async function getDb() {
  try {
    const conn = await getClientPromise();
    return conn.db(getDbName());
  } catch (err) {
    const e = err;
    const raw = e?.message || String(e);
    const isSelectionError =
      mongoServerSelectionErrorClass && e instanceof mongoServerSelectionErrorClass;
    if (isSelectionError || /SSL|TLS|handshake|certificate/i.test(raw)) {
      const isSrv = (cachedUri || getMongoUri()).startsWith('mongodb+srv://');
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
    const uri = getMongoUri();
    if (!uri) {
      throw new Error('MONGODB_URI is not set in environment');
    }

    const { default: mongoose } = await import('mongoose');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { serverApi: { version: '1' } });
      console.log('[mongo] Mongoose connected');
    }
  } catch (error) {
    console.error('[mongo] Mongoose connection error:', error?.message || error);
  }
};

export { clientPromise as default };
