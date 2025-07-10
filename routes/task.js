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


// New Task Form
router.get("/new", isLoggedIn, renderNewTaskForm);
router.post("/", isLoggedIn, validateTask, createTask);
// router.get("/new", renderNewTaskForm);
// router.post("/", validateTask, createTask);

// View Task Details
router.get("/:id", isLoggedIn, isTaskExists, getTaskById);
// router.get("/:id", isTaskExists, getTaskById);

// Edit Task Form
router.get("/:id/edit", isLoggedIn, isTaskExists, isTaskAuthor, renderEditTaskForm);
router.put("/:id", isLoggedIn, isTaskExists, isTaskAuthor, validateTask, updateTask);
// router.get("/:id/edit", renderEditTaskForm);
// router.put("/:id", validateTask, updateTask);

// Delete Task
router.delete("/:id", isLoggedIn, isTaskExists, isTaskAuthor, deleteTask);
// router.delete("/:id", isTaskExists, isTaskAuthor, deleteTask);

// View Tasks of a Specific User
router.get("/user/:userId", getTasksByUser);

module.exports = router;