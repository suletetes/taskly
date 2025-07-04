const User = require("../model/user");
const Task = require("../model/task");

// Create a new user
module.exports.createUser = async (req, res) => {
    try {
        const { fullname, username, email, avatar } = req.body;

        // Create and save the user
        const newUser = new User({ fullname, username, email, avatar });
        const savedUser = await newUser.save();

        // Render users/index with the new user in an array
        res.render("users/index", { users: [savedUser] });
    } catch (error) {
        console.error("Error creating user:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ error: errors });
        }

        res.status(500).json({ error: "Internal server error." });
    }
};

// Get all users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("users/index", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get a single user by ID
module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Render users/index with the single user in an array
        res.render("users/index", { users: [user] });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Update a user by ID
module.exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        // Render users/index with the updated user in an array
        res.render("users/index", { users: [updatedUser] });
    } catch (error) {
        console.error("Error updating user:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ error: errors });
        }

        res.status(500).json({ error: "Internal server error." });
    }
};

// Delete a user by ID
module.exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Delete all tasks associated with the user
        await Task.deleteMany({ user: id });

        // Delete the user
        await User.findByIdAndDelete(id);

        // Render users/index with the remaining users
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("users/index", { users });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get tasks for a specific user
module.exports.getUserTasks = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user and populate their tasks
        const user = await User.findById(id).populate("tasks");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Render users/index with the user's tasks as users
        res.render("users/index", { users: user.tasks });
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
module.exports.getPaginatedUsers = async (req, res) => {
    try {
        const USERS_PER_PAGE = 12;
        const { page = 1 } = req.query; // Get the current page from query params (default: 1)

        // Fetch users with pagination
        const users = await User.find() // Find all users
            .skip((page - 1) * USERS_PER_PAGE) // Skip users for previous pages
            .limit(USERS_PER_PAGE); // Limit to USERS_PER_PAGE
        const totalUsers = await User.countDocuments(); // Count all users for pagination

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

        // Render the EJS view and pass data
        res.render("users/index", {
            users,
            currentPage: Number(page),
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
    }
};