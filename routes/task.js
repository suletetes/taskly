/*
const express = require("express");
const {
    getTaskById,
    renderEditTaskForm,
    updateTask,
    deleteTask,
} = require("../controllers/task");
const { isLoggedIn, validateTask, isTaskExists, isTaskAuthor } = require("../middleware");

const router = express.Router();

// Task-specific Independent Routes
router.get("/:taskId/edit", isTaskExists, isTaskAuthor, renderEditTaskForm); // Render edit page for task
router.put("/:taskId", isTaskExists, validateTask, isTaskAuthor, updateTask); // Update specific task
router.delete("/:taskId", isTaskExists, isTaskAuthor, deleteTask); // Delete specific task

module.exports = router;
*/
