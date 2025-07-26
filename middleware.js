const { taskSchema, userSchema, userUpdateSchema } = require("./schemas.js"); // Import Joi schemas
const ExpressError = require("./utils/ExpressError"); // Custom error class
const User = require("./model/user.js");
const Task = require("./model/task.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Save the URL the user was trying to access
        req.flash("error", "You must be signed in first!");
        return res.redirect("/users/login");
    }
    next();
};

module.exports.validateUser = (req, res, next) => {
    const {error} = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.validateUserUpdate = (req, res, next) => {
    const {error} = userUpdateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.validateTask = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(err => err.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.isUserExists = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/users");
        }
        // Attach user to request for further middleware
        req.userData = user;
        next();
    } catch (error) {
        console.error("Error finding user:", error.message || error);
        req.flash("error", "Invalid user ID!");
        return res.redirect("/users");
        // return res.redirect(`/users/${userId}`);
    }
};

module.exports.isTaskExists = async (req, res, next) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            req.flash("error", "Task not found!");
            return res.redirect("/tasks");
        }
        // Attach task to request for further middleware
        req.taskData = task;
        next();
    } catch (error) {
        console.error("Error finding task:", error.message || error);
        req.flash("error", "Invalid task ID!");
        return res.redirect("/tasks");
    }
};

module.exports.isTaskAuthor = async (req, res, next) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            req.flash("error", "Task not found!");
            return res.redirect("/tasks");
        }
        if (!task.user.equals(req.user._id)) {
            req.flash("error", "You do not have permission to perform this action!");
            return res.redirect(`/tasks/${taskId}`);
        }
        next();
    } catch (error) {
        console.error("Authorization error:", error.message || error);
        req.flash("error", "Permission denied!");
        return res.redirect("/tasks");
    }
};