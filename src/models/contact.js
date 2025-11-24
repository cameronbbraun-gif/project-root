import { Schema } from require('mongoose');

const contactSchema = new Schema({
    first_name: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minLength: [2, "First name must be at least 2 characters"],
        maxLength: [50, "First name must be at most 50 characters"],
    },

    last_name: {
        type: String,
        required: [true, "Last Name is required"],
        trim: true,
        minLength: [2, "Last ame must be at least 2 characters"],
        maxLength: [50, "Last name must be at most 50 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },

    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        maxLength: [1000, "Message must be at most 1000 characters"],
    },

    date: {
        type: Date,
        default: Date.now,
    },
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;
    