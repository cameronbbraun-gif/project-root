import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AdminUserDocument extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: "admin" | "editor";
    createdAt: Date;
    resetTokenHash?: string;
    resetTokenExpires?: Date;
}

const AdminUserSchema = new Schema<AdminUserDocument>(
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
        resetTokenHash: {
            type: String,
        },
        resetTokenExpires: {
            type: Date,
        },
    },
    {
        versionKey: false,
    }
);

const AdminUser: Model<AdminUserDocument> =
    mongoose.models.AdminUser ||
    mongoose.model<AdminUserDocument>("AdminUser", AdminUserSchema);

export default AdminUser;
