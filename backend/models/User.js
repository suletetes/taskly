import mongoose from "mongoose";

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
    stats: {
        completed: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        ongoing: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        avgTime: { type: String, default: '0 hrs' }
    },
});

// Pre-save hook for unique username validation
userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified('username') && !this.isNew) {
            return next();
        }

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

const User = mongoose.model("User", userSchema);
export default User;