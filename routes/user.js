const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserTasks,
    getPaginatedUsers, // Add the new controller
} = require("../controllers/user");
const { isLoggedIn, validateUser, isUserExists } = require("../middleware");

const router = express.Router();

// Add the paginated users route
router.get("/paginated", isLoggedIn, getPaginatedUsers); // Ensure user is logged in to fetch paginated users

// Other user-related routes
router.post("/", validateUser, createUser);
router.get("/", isLoggedIn, getAllUsers); // Fetch all users (if required elsewhere)
router.get("/:id", isLoggedIn, isUserExists, getUserById);
router.put("/:id", isLoggedIn, isUserExists, validateUser, updateUser);
router.delete("/:id", isLoggedIn, isUserExists, deleteUser);
router.get("/:id/tasks", isLoggedIn, isUserExists, getUserTasks);

module.exports = router;