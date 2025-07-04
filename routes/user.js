const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserTasks,
} = require("../controllers/user");
const { isLoggedIn, validateUser, isUserExists } = require("../middleware");

const router = express.Router();

// Define user-related routes
router.post("/", validateUser, createUser); // Create a new user with validation
router.get("/", isLoggedIn, getAllUsers); // Ensure user is logged in to fetch all users
router.get("/:id", isLoggedIn, isUserExists, getUserById); // Ensure user exists before fetching by ID
router.put("/:id", isLoggedIn, isUserExists, validateUser, updateUser); // Validate and ensure user exists before updating
router.delete("/:id", isLoggedIn, isUserExists, deleteUser); // Ensure user exists before deletion
router.get("/:id/tasks", isLoggedIn, isUserExists, getUserTasks); // Fetch user tasks ensuring the user exists

module.exports = router;