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
        lowercase: true,
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


/*
// Pre-save hook for unique username/email validation
userSchema.pre("save", async function (next) {
    try {
        const existingUser = await mongoose.model("User").findOne({
            $or: [
                { username: this.username },
                { email: this.email },
            ],
        });

        if (existingUser && existingUser._id.toString() !== this._id.toString()) {
            if (existingUser.username === this.username) {
                const error = new Error("The username is already taken.");
                error.statusCode = 400;
                return next(error);
            }
            if (existingUser.email === this.email) {
                const error = new Error("The email is already in use.");
                error.statusCode = 400;
                return next(error);
            }
        }
        next();
    } catch (err) {
        return next(err);
    }
});

// Updated `findByUsername` for Mongoose Query Compatibility
function enhancedFindByUsername(model, queryParameters) {
    const query = {
        $or: [
            { username: queryParameters.username },
            { email: queryParameters.username },
        ],
    };

    return model.findOne(query); // Return Mongoose query object
}

// Configure `passport-local-mongoose`
userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
    findByUsername: enhancedFindByUsername, // Enhanced for email and username login
});*/
userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
});

const User = mongoose.model("User", userSchema);
module.exports = User;