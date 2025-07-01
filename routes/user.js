import express from "express";
import userController from "../controllers/user.js";
import { isLoggedIn, validateUser, isUserExists } from "../middleware.js";

const router = express.Router();

// Define user-related routes
router.post("/", validateUser, userController.createUser); // Create a new user with validation
router.get("/", isLoggedIn, userController.getAllUsers); // Ensure user is logged in to fetch all users
router.get("/:id", isLoggedIn, isUserExists, userController.getUserById); // Ensure user exists before fetching by ID
router.put("/:id", isLoggedIn, isUserExists, validateUser, userController.updateUser); // Validate and ensure user exists before updating
router.delete("/:id", isLoggedIn, isUserExists, userController.deleteUser); // Ensure user exists before deletion
router.get("/:id/tasks", isLoggedIn, isUserExists, userController.getUserTasks); // Fetch user tasks ensuring the user exists

export default router;