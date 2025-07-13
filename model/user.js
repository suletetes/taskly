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
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
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

// Pre-save hook for unique username/email validation
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

// Updated `findByUsername` for Mongoose Query Compatibility
const findByUsername = function (model, queryParameters) {
    const query = {
        $or: [{ username: queryParameters.username }, { email: queryParameters.username }],
    };

    return model.findOne(query); // Return the Mongoose Query object (no `.exec()` here)
};

// Configure `passport-local-mongoose`
userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
    findByUsername, // Use the compatibility fix
});

const User = mongoose.model("User", userSchema);
module.exports = User;