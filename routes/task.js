const express = require("express");
const {
    renderNewTaskForm,
    createTask,
    getAllTasks,
    getTaskById,
    renderEditTaskForm,
    updateTask,
    deleteTask,
    getTasksByUser,
} = require("../controllers/task");

const {
    isLoggedIn,
    validateTask,
    isTaskExists,
    isTaskAuthor,
} = require("../middleware");

const router = express.Router();

// Task Index - View All Tasks
router.get("/", isLoggedIn, getAllTasks);

// New Task Form
router.get("/new", isLoggedIn, renderNewTaskForm);
router.post("/", isLoggedIn, validateTask, createTask);

// View Task Details
router.get("/:id", isLoggedIn, isTaskExists, getTaskById);

// Edit Task Form
router.get("/:id/edit", isLoggedIn, isTaskExists, isTaskAuthor, renderEditTaskForm);
router.put("/:id", isLoggedIn, isTaskExists, isTaskAuthor, validateTask, updateTask);

// Delete Task
router.delete("/:id", isLoggedIn, isTaskExists, isTaskAuthor, deleteTask);

// View Tasks of a Specific User
router.get("/user/:userId", isLoggedIn, getTasksByUser);

module.exports = router;