const express = require('express');
const router = express.Router();
const User = require('../model/user');
const userTaskStats = require("../controllers/calculateProductivityStats");

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
                ...user.toObject(),
                stats
            };
        }));

        // Render the home page with users and their stats
        res.render('home/home', {
            title: 'Home | Taskly',
            hideNavbar: false,
            hideFooter: false,
            users: usersWithStats // Pass user data with stats to the view
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        req.flash("error", "Unable to load users.");
        res.render('home/home', {
            title: 'Home | Taskly',
            hideNavbar: false,
            hideFooter: false,
            users: [] // Fallback to an empty array in case of error
        });
    }
});

// About route
router.get('/about', (req, res) => {
    res.render('info/about', {
        title: 'About | Taskly',
        hideNavbar: false,
        hideFooter: false
    });
});

module.exports = router;