const express = require("express");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

const {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    showAllUsers,
    renderNewUserForm,
    renderEditUserForm,
    renderLoginForm,
    login,
    logout
} = require("../controllers/user");

const {
    createTask,
    renderNewTaskForm,
    updateTask,
    deleteTask,
    renderEditTaskForm,
} = require("../controllers/task");

const {
    isLoggedIn,
    validateUser,
    validateTask,
    isUserExists,
    isTaskExists,
    isTaskAuthor,
    validateUserUpdate
} = require("../middleware");

const router = express.Router();

// ==================== User Routes ====================

// Render a sign-up form
router.get("/new", (renderNewUserForm));

// Show all users (paginated)
router.get("/", (showAllUsers));

// Register a new user
router.post("/", validateUser, (createUser));

// Render the login form
router.get("/login", (renderLoginForm));

// Handle user login
router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true, // Show failure flash message
        failureRedirect: "/users/login", // Redirect back to login page on failure
    }),
    catchAsync(login)
);

router.get('/logout', logout)

// Get a specific user's profile
router.get("/:userId", getUserById);

// Render an edit form for the user
router.get("/:userId/edit", isLoggedIn, isUserExists, renderEditUserForm);
// router.get("/:id/edit", isLoggedIn, catchAsync(renderEditUserForm), isUserExists);

// Update user details
router.put("/:userId", isLoggedIn, isUserExists, validateUserUpdate, catchAsync(updateUser));

// Delete a user
router.delete("/:userId", isLoggedIn, isUserExists, catchAsync(deleteUser));

// ==================== Task Routes Nested Under Users ====================

// Render a form for adding a task
router.get("/:userId/tasks/new", isLoggedIn, isUserExists, catchAsync(renderNewTaskForm));

// Create a new task
router.post("/:userId/tasks", isLoggedIn, isUserExists, validateTask, catchAsync(createTask));

// Render a form to edit a specific task
router.get("/:userId/tasks/:taskId/edit", isLoggedIn, isUserExists, isTaskExists, isTaskAuthor, catchAsync(renderEditTaskForm));

// Update a specific task
router.put("/:userId/tasks/:taskId", isLoggedIn, isUserExists, isTaskExists, validateTask, isTaskAuthor, catchAsync(updateTask));

// Delete a specific task
router.delete("/:userId/tasks/:taskId", isLoggedIn, isUserExists, isTaskExists, isTaskAuthor, catchAsync(deleteTask));

module.exports = router;