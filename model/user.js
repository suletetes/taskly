const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

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
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"], // Validation for email
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dbdbod1wt/image/upload/v1751666550/placeholder-user_rbr3rs.png", // Updated default placeholder
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task", // Reference to the Task model
        },
    ],
});

// Pre-save hook for unique username/mail validation
userSchema.pre("save", async function (next) {
    try {
        const existingUser = await mongoose.model("User").findOne({
            $or: [{ username: this.username }, { email: this.email }],
        });

        if (existingUser) {
            if (existingUser.username === this.username) {
                throw new Error("The username is already taken.");
            } else if (existingUser.email === this.email) {
                throw new Error("The email is already in use.");
            }
        }

        next();
    } catch (err) {
        next(err);
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
    findByUsername: async function (model, queryParameters) {
        return model.findOne({
            $or: [{ username: queryParameters.username }, { email: queryParameters.username }],
        });
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;