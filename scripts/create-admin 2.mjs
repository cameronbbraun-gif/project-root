import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable");
  process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (key) => {
  const index = args.indexOf(key);
  return index === -1 ? null : args[index + 1];
};

const name = getArg("--name");
const email = getArg("--email");
const password = getArg("--password");
const role = getArg("--role") || "admin";

if (!name || !email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs --name \"Full Name\" --email you@example.com --password yourpassword [--role admin|editor]"
  );
  process.exit(1);
}

if (!["admin", "editor"].includes(role)) {
  console.error("Role must be 'admin' or 'editor'.");
  process.exit(1);
}

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor"],
      default: "admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const AdminUser =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminSchema);

try {
  await mongoose.connect(MONGODB_URI, { serverApi: { version: "1" } });

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = name.trim();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await AdminUser.findOne({ email: normalizedEmail });
  if (existing) {
    existing.name = normalizedName;
    existing.passwordHash = passwordHash;
    existing.role = role;
    await existing.save();
    console.log(`Updated admin user: ${normalizedEmail}`);
  } else {
    await AdminUser.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role,
    });
    console.log(`Created admin user: ${normalizedEmail}`);
  }
} catch (error) {
  console.error("Failed to create admin user:", error?.message || error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
