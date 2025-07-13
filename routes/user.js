const express = require("express");
const {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    showAllUsers,
    renderNewUserForm,
    renderEditUserForm,
    renderLoginForm,
} = require("../controllers/user");
const {
    createTask, renderNewTaskForm, updateTask, deleteTask, renderEditTaskForm, getTaskById,
} = require("../controllers/task");
const {
    isLoggedIn, validateUser, validateTask, isUserExists, isTaskExists, isTaskAuthor,
} = require("../middleware");
const passport = require("passport");

const router = express.Router();

// User Routes
router.get("/new", renderNewUserForm); // Render a sign-up form
router.get("/", showAllUsers); // Show paginated list of users
router.post("/", validateUser, createUser); // Register a new user
router.get("/login", renderLoginForm); // Render the login form
router.post("/login", passport.authenticate("local", {
    failureFlash: true, failureRedirect: "/users/login",
}), (req, res) => {
    req.flash("success", "Successfully logged in!");
    res.redirect("/users"); // Redirect after login
});
router.get("/:id", isUserExists, getUserById); // Get a user's profile
router.get("/:id/edit", isLoggedIn, isUserExists, renderEditUserForm); // Render edit form
router.put("/:id", isLoggedIn, isUserExists, validateUser, updateUser); // Update user details
router.delete("/:id", isUserExists, deleteUser); // Delete a user

// Task Routes Nested under Users
router.get("/:userId/tasks/new", isUserExists, renderNewTaskForm); // Render a form for adding tasks
router.post("/:userId/tasks", isUserExists, validateTask, createTask); // Add a task for a user
// router.get("/:userId/tasks/:taskId", isUserExists, isTaskExists, getTaskById); // Get details of a specific task
router.get("/:userId/tasks/:taskId/edit", isUserExists, isTaskExists, isTaskAuthor, renderEditTaskForm); // Render a task edit form
router.put("/:userId/tasks/:taskId", isUserExists, isTaskExists, validateTask, isTaskAuthor, updateTask); // Update a task
router.delete("/:userId/tasks/:taskId", isUserExists, isTaskExists, isTaskAuthor, deleteTask); // Delete a task

module.exports = router;