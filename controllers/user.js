import User from "../model/user.js";
import Task from "../model/task.js";

const userController = {
    // Create a new user
    createUser: async (req, res) => {
        try {
            const { fullname, username, email, avatar } = req.body;

            // Create and save the user
            const newUser = new User({ fullname, username, email, avatar });
            const savedUser = await newUser.save();

            res.status(201).json({ message: "User created successfully.", user: savedUser });
        } catch (error) {
            console.error("Error creating user:", error);

            // Handle validation errors
            if (error.name === "ValidationError") {
                const errors = Object.values(error.errors).map((err) => err.message);
                return res.status(400).json({ error: errors });
            }

            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().populate("tasks", "title due priority"); // Populate task info
            res.status(200).json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get a single user by ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id).populate("tasks", "title due priority"); // Populate task info

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Update a user by ID
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Find and update the user
            const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found." });
            }

            res.status(200).json({ message: "User updated successfully.", user: updatedUser });
        } catch (error) {
            console.error("Error updating user:", error);

            // Handle validation errors
            if (error.name === "ValidationError") {
                const errors = Object.values(error.errors).map((err) => err.message);
                return res.status(400).json({ error: errors });
            }

            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Delete a user by ID
    deleteUser: async (req, res) => {
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

            res.status(200).json({ message: "User and their tasks deleted successfully." });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get tasks for a specific user
    getUserTasks: async (req, res) => {
        try {
            const { id } = req.params;

            // Find the user and populate their tasks
            const user = await User.findById(id).populate("tasks");
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            res.status(200).json({ tasks: user.tasks });
        } catch (error) {
            console.error("Error fetching user tasks:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },
};

export default userController;