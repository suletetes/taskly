const Task = require("../model/task");
const User = require("../model/user");

// Render 'New Task' Form
module.exports.renderNewTaskForm = async (req, res) => {
    try {
        const {userId} = req.params; // Extract user ID
        const user = await User.findById(userId); // Fetch the user

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        const users = await User.find(); // Fetch all users for the dropdown
        res.render("task/add", {
            users,
            title: 'Add Task | Taskly',
            hideNavbar: false,
            hideFooter: false
        });
    } catch (error) {
        console.error("Error rendering task form:", error);
        req.flash("error", "Could not load task creation form.");
        res.redirect("/tasks");
    }
};

// Create a New Task
module.exports.createTask = async (req, res) => {
    try {
        console.log("Received due date:", req.body.due);

        const {userId} = req.params; // Extract user ID
        const {title, due, priority, description, tags} = req.body; // Get task details

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect(`/users/${userId}/tasks/new`);
        }

        // Validate due date (server-side check)
        const dueDate = new Date(due);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight of today

        if (dueDate < today) {
            req.flash("error", "Due date cannot be in the past.");
            return res.redirect(`/users/${userId}/tasks/new`);
        }

        // Create a new task and associate it with the user
        const newTask = new Task({title, due: dueDate, priority, description, tags, user: userId});
        await newTask.save();

        // Save the task to the user's list of tasks
        user.tasks.push(newTask._id);
        await user.save();

        req.flash("success", "Task created successfully!");
        res.redirect(`/users/${userId}`); // Redirect to user's task list
    } catch (error) {
        console.error("Error creating task:", error);
        req.flash("error", "Failed to create task.");
        res.redirect(`/users/${req.params.userId}/tasks/new`);
    }
};
// Render Edit Task Form
module.exports.renderEditTaskForm = async (req, res) => {
    try {
        const {taskId, userId} = req.params;
        const task = await Task.findById(taskId);
        const users = await User.find(); // ✅ Fixed line

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect(`/users/${userId}`);
        }

        res.render("task/update", {
            task,
            users,
            title: 'Update Task | Taskly',
            hideNavbar: false,
            hideFooter: false
        });
    } catch (error) {
        console.error("Error loading edit task form:", error);
        req.flash("error", "Failed to load task edit form.");
        res.redirect(`/users/${req.params.userId}`);
    }
};
// Mark a Task as Done
module.exports.complete = async (req, res) => {
    try {
        const {taskId, userId} = req.params;
        const task = await Task.findById(taskId);
        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
        }
        task.status = "completed"; // or use a boolean: task.completed = true;
        await task.save();
        req.flash("success", "Task marked as done!");
        res.redirect(`/users/${userId}`);
    } catch (error) {
        console.error("Error marking task as done:", error);
        req.flash("error", "Could not mark task as done.");
        res.redirect(`/task/${req.params.taskId}/edit`);
    }
};

// Update a Task by ID
module.exports.updateTask = async (req, res) => {
    try {
        const {taskId, userId} = req.params;
        const updates = req.body;

        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {new: true, runValidators: true});
        if (!updatedTask) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
        }

        req.flash("success", "Task updated successfully!");
        res.redirect(`/users/${userId}`);
    } catch (error) {
        console.error("Error updating task:", error);
        req.flash("error", "Could not update task.");
        res.redirect(`/task/${taskId}/edit`);
    }
};

// Delete a Task by ID
module.exports.deleteTask = async (req, res) => {
    try {
        const {taskId} = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect(`/users/${userId}`);
        }

        await User.findByIdAndUpdate(task.user, {$pull: {tasks: task._id}});
        await Task.findByIdAndDelete(taskId);

        req.flash("success", "Task deleted successfully!");
        res.redirect(`/users/${userId}`);
    } catch (error) {
        console.error("Error deleting task:", error);
        req.flash("error", "Failed to delete task.");
        res.redirect(`/users/${userId}`);
    }
};

// Get All Tasks of a Specific User with Pagination
/*module.exports.getTasksByUser = async (req, res) => {
    try {
        const {userId} = req.params;
        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/list");
        }

        const perPage = 8; // Tasks per page
        const page = Math.max(1, parseInt(req.query.page, 10) || 1); // Current page, defaults to 1

        const totalTasks = await Task.countDocuments({user: userId}); // Total tasks count
        const totalPages = Math.ceil(totalTasks / perPage); // Calculate total pages

        // Fetch paginated tasks
        const tasks = await Task.find({user: userId})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({dueDate: 1}); // Optional: Sort tasks by due date

        // Redirect to the last available page if the current is out of range
        if (page > totalPages && totalPages > 0) {
            return res.redirect(`/tasks/${userId}?page=${totalPages}`);
        }

        res.render("task/list", {
            tasks,
            user,
            title: 'Add Task | Taskly',
            hideNavbar: false,
            hideFooter: false,
            pagination: {
                totalTasks,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching user's tasks:", error);
        req.flash("error", "Could not fetch tasks for the user.");
        res.redirect("/list");
    }
};*/

