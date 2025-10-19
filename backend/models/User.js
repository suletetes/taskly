const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    avatar: {
        type: String,
        default:
            "https://res.cloudinary.com/dbdbod1wt/image/upload/v1751666550/placeholder-user_rbr3rs.png",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
});

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
    try {
        // Only hash the password if it has been modified (or is new)
        if (!this.isModified("password")) return next();

        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;

        next();
    } catch (err) {
        return next(err);
    }
});

// Pre-save hook for unique username validation
userSchema.pre("save", async function (next) {
    try {
        const existingUser = await mongoose.model("User").findOne({
            username: this.username,
        });

        if (existingUser && existingUser._id.toString() !== this._id.toString()) {
            const error = new Error("The username is already taken.");
            error.statusCode = 400;
            return next(error);
        }
        next();
    } catch (err) {
        return next(err);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user without password
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model("User", userSchema);
module.exports = User;