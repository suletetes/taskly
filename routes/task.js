import express from "express";
import taskController from "../controllers/task.js";
import { isLoggedIn, validateTask, isTaskExists, isTaskAuthor } from "../middleware.js";

const router = express.Router();

// Define task-related routes
router.post("/", isLoggedIn, validateTask, taskController.createTask); // Create a new task with validation
router.get("/", isLoggedIn, taskController.getAllTasks); // Get all tasks
router.get("/:id", isLoggedIn, isTaskExists, taskController.getTaskById); // Ensure task exists before fetching by ID
router.put("/:id", isLoggedIn, isTaskExists, isTaskAuthor, validateTask, taskController.updateTask); // Validate and ensure task exists before updating
router.delete("/:id", isLoggedIn, isTaskExists, isTaskAuthor, taskController.deleteTask); // Ensure task exists before deletion
router.get("/user/:userId", isLoggedIn, taskController.getTasksByUser); // Fetch all tasks of a specific user

export default router;