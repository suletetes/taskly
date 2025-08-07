const express = require('express');
const router = express.Router();
const User = require('../model/user');
const userTaskStats = require("../controllers/calculateProductivityStats");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const {login, logout, renderNewUserForm, renderLoginForm, createUser} = require("../controllers/user");
const {validateUser} = require("../middleware");

router.get('/', async (req, res) => {
    try {
        // Fetch a limited number of users (e.g., top 6)
        const users = await User.find()
            .populate('tasks', 'status') // Fetch only task statuses
            .limit(4);

        // Calculate stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const stats = await userTaskStats.calculateProductivityStats(user._id);
            return {
                ...user.toObject(), stats
            };
        }));

        // Render the home page with users and their stats
        res.render('home/home', {
            title: 'Home | Taskly', hideNavbar: false, hideFooter: false, users: usersWithStats // Pass user data with stats to the view
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        req.flash("error", "Unable to load users.");
        res.render('home/home', {
            title: 'Home | Taskly', hideNavbar: false, hideFooter: false, users: [] // Fallback to an empty array in case of error
        });
    }
});

// Render a sign-up form
router.get("/signup", (renderNewUserForm));

// Register a new user
router.post("/", validateUser, (createUser));

// Render the login form
router.get("/login", (renderLoginForm));

// Render the login form
router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true, // Show failure flash message
        failureRedirect: "/users/login", // Redirect back to login page on failure
    }),
    catchAsync(login)
);

// logout route
router.get('/logout', logout)


// About route
router.get('/about', (req, res) => {
    res.render('info/about', {
        title: 'About | Taskly', hideNavbar: false, hideFooter: false
    });
});

module.exports = router;