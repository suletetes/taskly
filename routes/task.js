import express from "express";
import taskController from "../controllers/task.js";
const router = express.Router();

// Define task-related routes
router.post("/", taskController.createTask); // Create a new task
router.get("/", taskController.getAllTasks); // Get all tasks
router.get("/:id", taskController.getTaskById); // Get a single task by its ID
router.put("/:id", taskController.updateTask); // Update a task by its ID
router.delete("/:id", taskController.deleteTask); // Delete a task by its ID
router.get("/user/:userId", taskController.getTasksByUser); // Get all tasks of a specific user

export default router;