const { taskSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
// const Task = require('./models/task'); // Task model
// const User = require('./models/user'); // User model

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

// Middleware to validate task data using the Joi schema
module.exports.validateTask = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400); // Custom error with a status code of 400
    } else {
        next();
    }
};

// Middleware to check if the current user is the author of the task
module.exports.isTaskAuthor = async (req, res, next) => {
    const { id } = req.params; // Task ID from the request parameters
    const task = await Task.findById(id);
    if (!task) {
        req.flash('error', 'Task not found!');
        return res.redirect('/tasks');
    }
    // Check if the current user is the author of the task
    if (!task.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/tasks');
    }
    next();
};

// Middleware to check if the user exists for user-specific operations
module.exports.isUserExists = async (req, res, next) => {
    const { id } = req.params; // User ID from the request parameters
    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'User not found!');
        return res.redirect('/users');
    }
    next();
};