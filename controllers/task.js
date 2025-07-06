const Task = require("../model/task");
const User = require("../model/user");

// Create a new task
module.exports.createTask = async (req, res) => {
    try {
        const {title, due, priority, description, tags, labels, userId} = req.body;

        // Validate the user ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: "User not found."});
        }

        // Create the task
        const newTask = new Task({title, due, priority, description, tags, labels, user: userId});
        const savedTask = await newTask.save();

        // Associate the task with the user
        user.tasks.push(savedTask._id);
        await user.save();

        // Render users/index with all users after task creation
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("task/add", {users});

        res.status(201).json({message: "Task created successfully.", task: savedTask});
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({error: "Internal server error."});
    }
};

// Get all tasks
/*
module.exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate("user", "username email"); // Populate user info

        // Render users/index with all users (since view expects users)
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        // res.render("users/index", { users }); todo none

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
*/

// Get a single task by ID
/*
module.exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate("user", "username email"); // Populate user info
        if (!task) {
            return res.status(404).json({ error: "Task not found." });
        }

        // Render users/index with the user owning the task
        const user = await User.findById(task.user).populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("user/list", { users: [user] });

        res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
*/

// Update a task by ID
module.exports.updateTask = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;

        // Find and update the task
        const updatedTask = await Task.findByIdAndUpdate(id, updates, {new: true, runValidators: true});
        if (!updatedTask) {
            return res.status(404).json({error: "Task not found."});
        }

        // Render users/index with all users after task update
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("user/update", {users});

        res.status(200).json({message: "Task updated successfully.", task: updatedTask});
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({error: "Internal server error."});
    }
};

// Delete a task by ID
module.exports.deleteTask = async (req, res) => {
    try {
        const {id} = req.params;

        // Find the task
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({error: "Task not found."});
        }

        // Remove the task from the associated user's tasks array
        await User.findByIdAndUpdate(task.user, {$pull: {tasks: task._id}});

        // Delete the task
        await Task.findByIdAndDelete(id);

        // Render users/index with all users after task deletion
        const users = await User.find().populate("tasks", {
            title: 1,
            due: 1,
            priority: 1,
            status: 1,
        });
        res.render("user/profile", {users});

        res.status(200).json({message: "Task deleted successfully."});
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({error: "Internal server error."});
    }
};

// Get tasks for a specific user
module.exports.getTasksByUser = async (req, res) => {
    try {
        const {userId} = req.params;

        // Validate the user ID
        const user = await User.findById(userId).populate("tasks");
        if (!user) {
            return res.status(404).json({error: "User not found."});
        }

        // Task count stats
        const completed = await Task.countDocuments({user: userId, status: "completed"});
        const failed = await Task.countDocuments({user: userId, status: "failed"});
        const ongoing = await Task.countDocuments({user: userId, status: "in-progress"});

        // Render users/index with the user's tasks as users
        res.render("users/index", {users: user.tasks});

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
        res.status(500).json({error: "Internal server error."});
    }
};

/* productivity stats */

// Fetch Completed Tasks Count
const getCompletedTasksCount = async (userId) => {
    return await Task.countDocuments({
        user: userId,
        status: "completed",
    });
};

// Fetch Failed Tasks Count
const getFailedTasksCount = async (userId) => {
    return await Task.countDocuments({
        user: userId,
        status: "failed",
    });
};

// Fetch Ongoing Tasks Count
const getOngoingTasksCount = async (userId) => {
    return await Task.countDocuments({
        user: userId,
        status: "in-progress",
    });
};

// Fetch Completed Tasks for Time Calculations
const getCompletedTasksWithTime = async (userId) => {
    return await Task.find(
        {user: userId, status: "completed"},
        {updatedAt: 1, createdAt: 1}
    );
};

// Calculate Average Time to Complete Tasks
const calculateAverageCompletionTime = (completedTasks) => {
    const totalTime = completedTasks.reduce((total, task) => {
        const timeTaken = task.updatedAt - task.createdAt; // Difference in milliseconds
        return total + timeTaken;
    }, 0);

    return completedTasks.length > 0
        ? (totalTime / completedTasks.length) / (1000 * 60 * 60) // Convert to hours
        : 0;
};

// Calculate Completion Rate
const calculateCompletionRate = (completedTasksCount, failedTasksCount) => {
    const totalTasks = completedTasksCount + failedTasksCount;
    return totalTasks > 0
        ? ((completedTasksCount / totalTasks) * 100).toFixed(2)
        : 0;
};

// Calculate Streak
const calculateStreak = async (userId) => {
    const completedTasks = await Task.find(
        {user: userId, status: "completed"},
        {updatedAt: 1}
    ).sort({updatedAt: -1});

    if (!completedTasks.length) return 0;

    const completionDates = [...new Set(completedTasks.map(task => {
        const date = new Date(task.updatedAt);
        return date.toISOString().split("T")[0];
    }))];

    let streak = 1; // Start with 1 day
    const today = new Date().toISOString().split("T")[0];

    if (completionDates[0] !== today) return 0;

    for (let i = 1; i < completionDates.length; i++) {
        const prevDate = new Date(completionDates[i - 1]);
        const currDate = new Date(completionDates[i]);

        const diffInDays = (prevDate - currDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
        if (diffInDays === 1) {
            streak++;
        } else {
            break; // Break the streak
        }
    }

    return streak;
};

// Calculate Productivity Stats
const calculateProductivityStats = async (userId) => {
    try {
        const completedTasksCount = await getCompletedTasksCount(userId);
        const failedTasksCount = await getFailedTasksCount(userId);
        const ongoingTasksCount = await getOngoingTasksCount(userId);
        const completedTasks = await getCompletedTasksWithTime(userId);

        const avgTime = calculateAverageCompletionTime(completedTasks);
        const completionRate = calculateCompletionRate(completedTasksCount, failedTasksCount);
        const streak = await calculateStreak(userId);

        return {
            completed: completedTasksCount,
            failed: failedTasksCount,
            ongoing: ongoingTasksCount,
            completionRate: `${completionRate}%`,
            streak: `${streak} days`,
            avgTime: `${avgTime.toFixed(2)} hrs`,
        };
    } catch (error) {
        console.error("Error calculating productivity stats:", error);
        throw new Error("Could not calculate productivity stats");
    }
};

// Export all functions
module.exports = {
    getCompletedTasksCount,
    getFailedTasksCount,
    getOngoingTasksCount,
    getCompletedTasksWithTime,
    calculateAverageCompletionTime,
    calculateCompletionRate,
    calculateStreak,
    calculateProductivityStats,
};
