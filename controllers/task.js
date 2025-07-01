import Task from "../model/task.js";
import User from "../model/user.js";

// Controller for task operations
const taskController = {
    // Create a new task
    createTask: async (req, res) => {
        try {
            const { title, due, priority, description, tags, labels, userId } = req.body;

            // Validate the user ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            // Create the task
            const newTask = new Task({ title, due, priority, description, tags, labels, user: userId });
            const savedTask = await newTask.save();

            // Associate the task with the user
            user.tasks.push(savedTask._id);
            await user.save();

            res.status(201).json({ message: "Task created successfully.", task: savedTask });
        } catch (error) {
            console.error("Error creating task:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get all tasks
    getAllTasks: async (req, res) => {
        try {
            const tasks = await Task.find().populate("user", "username email"); // Populate user info
            res.status(200).json(tasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get a single task by ID
    getTaskById: async (req, res) => {
        try {
            const { id } = req.params;
            const task = await Task.findById(id).populate("user", "username email"); // Populate user info
            if (!task) {
                return res.status(404).json({ error: "Task not found." });
            }
            res.status(200).json(task);
        } catch (error) {
            console.error("Error fetching task:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Update a task by ID
    updateTask: async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Find and update the task
            const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
            if (!updatedTask) {
                return res.status(404).json({ error: "Task not found." });
            }

            res.status(200).json({ message: "Task updated successfully.", task: updatedTask });
        } catch (error) {
            console.error("Error updating task:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Delete a task by ID
    deleteTask: async (req, res) => {
        try {
            const { id } = req.params;

            // Find the task
            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ error: "Task not found." });
            }

            // Remove the task from the associated user's tasks array
            await User.findByIdAndUpdate(task.user, { $pull: { tasks: task._id } });

            // Delete the task
            await Task.findByIdAndDelete(id);

            res.status(200).json({ message: "Task deleted successfully." });
        } catch (error) {
            console.error("Error deleting task:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Get tasks for a specific user
    getTasksByUser: async (req, res) => {
        try {
            const { userId } = req.params;

            // Validate the user ID
            const user = await User.findById(userId).populate("tasks");
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            // Task count stats
            const completed = await Task.countDocuments({ user: userId, status: "completed" });
            const failed = await Task.countDocuments({ user: userId, status: "failed" });
            const ongoing = await Task.countDocuments({ user: userId, status: "in-progress" });

            res.status(200).json({
                tasks: user.tasks,
                stats: {
                    completed,
                    failed,
                    ongoing,
                },
            });
        } catch (error) {
            console.error("Error fetching user tasks:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },
};

export default taskController;