const Task = require("../model/task");
const User = require("../model/user");

// Render 'New Task' Form
module.exports.renderNewTaskForm = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users for the dropdown
        res.render("tasks/add", { users });
    } catch (error) {
        console.error("Error rendering task form:", error);
        req.flash("error", "Could not load task creation form.");
        res.redirect("/tasks");
    }
};

// Create a New Task
module.exports.createTask = async (req, res) => {
    try {
        const { title, due, priority, description, tags, labels, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/tasks/new");
        }

        const newTask = new Task({ title, due, priority, description, tags, labels, user: userId });
        await newTask.save();

        user.tasks.push(newTask._id);
        await user.save();

        req.flash("success", "Task created successfully!");
        res.redirect("/tasks");
    } catch (error) {
        console.error("Error creating task:", error);
        req.flash("error", "Failed to create task.");
        res.redirect("/tasks/new");
    }
};

// Get All Tasks
module.exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate("user", "fullname username");
        res.render("tasks/list", { tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        req.flash("error", "Unable to fetch tasks.");
        res.redirect("/");
    }
};

// Get a Single Task by ID
module.exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate("user", "fullname username email");

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/tasks");
        }

        res.render("tasks/show", { task });
    } catch (error) {
        console.error("Error fetching task:", error);
        req.flash("error", "Failed to retrieve task.");
        res.redirect("/tasks");
    }
};

// Render Edit Task Form
module.exports.renderEditTaskForm = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id); // Fetch task data for editing
        const users = await User.find(); // Fetch all users for reassigning task

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/tasks");
        }

        res.render("tasks/update", { task, users });
    } catch (error) {
        console.error("Error loading edit task form:", error);
        req.flash("error", "Failed to load task edit form.");
        res.redirect("/tasks");
    }
};

// Update a Task by ID
module.exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedTask) {
            req.flash("error", "Task not found.");
            return res.redirect("/tasks");
        }

        req.flash("success", "Task updated successfully!");
        res.redirect(`/tasks/${id}`);
    } catch (error) {
        console.error("Error updating task:", error);
        req.flash("error", "Could not update task.");
        res.redirect(`/tasks/${id}/edit`);
    }
};

// Delete a Task by ID
module.exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/tasks");
        }

        await User.findByIdAndUpdate(task.user, { $pull: { tasks: task._id } });
        await Task.findByIdAndDelete(id);

        req.flash("success", "Task deleted successfully!");
        res.redirect("/tasks");
    } catch (error) {
        console.error("Error deleting task:", error);
        req.flash("error", "Failed to delete task.");
        res.redirect("/tasks");
    }
};

// Get All Tasks of a Specific User
module.exports.getTasksByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("tasks");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/tasks");
        }

        res.render("tasks/list", { tasks: user.tasks, user });
    } catch (error) {
        console.error("Error fetching user's tasks:", error);
        req.flash("error", "Could not fetch tasks for the user.");
        res.redirect("/tasks");
    }
};

// Calculate Productivity Stats (Reusable Functionality)
const fetchTaskCounts = async (userId, status) => {
    return await Task.countDocuments({ user: userId, status });
};

const fetchCompletedTasksWithTime = async (userId) => {
    return await Task.find({ user: userId, status: "completed" }, { createdAt: 1, updatedAt: 1 });
};

const calculateAverageCompletionTime = (completedTasks) => {
    const totalDuration = completedTasks.reduce((acc, task) => acc + (task.updatedAt - task.createdAt), 0);
    return completedTasks.length > 0
        ? (totalDuration / completedTasks.length) / (60 * 60 * 1000) // Convert to hours
        : 0;
};

const calculateCompletionRate = (completed, failed) => {
    const total = completed + failed;
    return total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
};

const calculateCompletionStreak = async (userId) => {
    const completedTasks = await Task.find({ user: userId, status: "completed" })
        .sort({ updatedAt: -1 })
        .distinct("updatedAt");

    if (completedTasks.length === 0) return 0;

    const dates = completedTasks
        .map((time) => new Date(time).toISOString().split("T")[0])
        .filter((day, i, arr) => !i || arr[i - 1] === day);

    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
        if (new Date(dates[i - 1]) - new Date(dates[i]) === 86400000) streak++;
        else break;
    }

    return streak;
};

// Consolidated Function to Calculate Productivity Stats
module.exports.calculateProductivityStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const completed = await fetchTaskCounts(userId, "completed");
        const failed = await fetchTaskCounts(userId, "failed");
        const inProgress = await fetchTaskCounts(userId, "in-progress");
        const completedTasks = await fetchCompletedTasksWithTime(userId);

        const streak = await calculateCompletionStreak(userId);
        const avgCompletionTime = calculateAverageCompletionTime(completedTasks);
        const completionRate = calculateCompletionRate(completed, failed);

        res.status(200).json({
            completed,
            failed,
            inProgress,
            streak: `${streak} days`,
            avgCompletionTime: `${avgCompletionTime.toFixed(2)} hours`,
            completionRate: `${completionRate}%`,
        });
    } catch (error) {
        console.error("Error calculating productivity stats:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};