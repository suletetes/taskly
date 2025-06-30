const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // For password hashing

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true, // Ensure username is unique
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, // Ensure email is unique
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"], // Regex for email validation
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    avatar: {
        type: String,
        default: "../../public/img/avatars/avatar1.png", // Default avatar path
    },
    created_at: {
        type: Date,
        default: Date.now, // Automatically sets the creation date
    },
});

// Pre-save hook for hashing the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If password is not modified, skip

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password with salt
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Export the model
const User = mongoose.model("User", userSchema);
module.exports = User;