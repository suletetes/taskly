const express = require("express");
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUser,
} = require("../controllers/task");
const { isLoggedIn, validateTask, isTaskExists, isTaskAuthor } = require("../middleware");

const router = express.Router();

// Define task-related routes
router.post("/", isLoggedIn, validateTask, createTask); // Create a new task with validation
router.get("/", isLoggedIn, getAllTasks); // Get all tasks
router.get("/:id", isLoggedIn, isTaskExists, getTaskById); // Ensure task exists before fetching by ID
router.put("/:id", isLoggedIn, isTaskExists, isTaskAuthor, validateTask, updateTask); // Validate and ensure task exists before updating
router.delete("/:id", isLoggedIn, isTaskExists, isTaskAuthor, deleteTask); // Ensure task exists before deletion
router.get("/user/:userId", isLoggedIn, getTasksByUser); // Fetch all tasks of a specific user

module.exports = router;