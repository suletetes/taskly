import { taskSchema, userSchema } from "./schemas.js"; // Import schemas
import User from "../model/user.js";
import Task from "../model/task.js";
import ExpressError from "../utils/ExpressError.js"; // Custom error class

// Middleware: Check if the user is authenticated (logged in)
export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // Ensure `passport` is being used for authentication
        req.session.returnTo = req.originalUrl; // Save the page to return after login
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// Middleware: Validate user data using Joi schema from schemas.js
export const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(", ");
        throw new ExpressError(message, 400); // Throw custom error
    }
    next();
};

// Middleware: Validate task data using Joi schema from schemas.js
export const validateTask = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(", ");
        throw new ExpressError(message, 400); // Throw custom error
    }
    next();
};

// Middleware: Check if a user exists
export const isUserExists = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/users");
        }
        next();
    } catch (error) {
        console.error("Error finding user:", error);
        req.flash("error", "Invalid user!");
        return res.redirect("/users");
    }
};

// Middleware: Check if a task exists
export const isTaskExists = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            req.flash("error", "Task not found!");
            return res.redirect("/tasks");
        }
        next();
    } catch (error) {
        console.error("Error finding task:", error);
        req.flash("error", "Invalid task!");
        return res.redirect("/tasks");
    }
};

// Middleware: Check if the user owns the task
export const isTaskAuthor = async (req, res, next) => {
    try {
        const { id } = req.params; // Task ID
        const task = await Task.findById(id);

        if (!task) {
            req.flash("error", "Task not found!");
            return res.redirect("/tasks");
        }

        // Ensure the logged-in user is the owner of the task
        if (!task.user.equals(req.user._id)) {
            req.flash("error", "You do not have permission for this action!");
            return res.redirect("/tasks");
        }
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        req.flash("error", "Authorization failed!");
        return res.redirect("/tasks");
    }
};