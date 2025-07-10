const Task = require("../model/task");
const User = require("../model/user");

// Render 'New Task' Form
module.exports.renderNewTaskForm = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users for the dropdown
        res.render("task/add", {
            users,
            title: 'Add Task | Taskly',
            hideNavbar: false,
            hideFooter: false
        });
        // console.log(this)
    } catch (error) {
        console.error("Error rendering task form:", error);
        req.flash("error", "Could not load task creation form.");
        res.redirect("/tasks");
    }
};

// Create a New Task
module.exports.createTask = async (req, res) => {
    try {
        const {title, due, priority, description, tags, labels, userId} = req.body;

        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/task/add");
        }

        const newTask = new Task({title, due, priority, description, tags, labels, user: userId});
        await newTask.save();

        user.tasks.push(newTask._id);
        await user.save();

        req.flash("success", "Task created successfully!");
        res.redirect("/task/list");
    } catch (error) {
        console.error("Error creating task:", error);
        req.flash("error", "Failed to create task.");
        res.redirect("/task/add");
    }
};


/*
#todo
remove get all task

*/
// Get a Single Task by ID
module.exports.getTaskById = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findById(id).populate("user", "fullname username email");

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
        }

        res.render("task/show", {task});
    } catch (error) {
        console.error("Error fetching task:", error);
        req.flash("error", "Failed to retrieve task.");
        res.redirect("/list");
    }
};

// Render Edit Task Form
module.exports.renderEditTaskForm = async (req, res) => {
    try {
        const {id} = req.params;
        const task = await Task.findById(id); // Fetch task data for editing
        const users = await User.find(); // Fetch all users for reassigning task

        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
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
        res.redirect("/tasks");
    }
};

// Update a Task by ID
module.exports.updateTask = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {new: true, runValidators: true});
        if (!updatedTask) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
        }

        req.flash("success", "Task updated successfully!");
        res.redirect(`/task/${id}`);
    } catch (error) {
        console.error("Error updating task:", error);
        req.flash("error", "Could not update task.");
        res.redirect(`/task/${id}/edit`);
    }
};

// Delete a Task by ID
module.exports.deleteTask = async (req, res) => {
    try {
        const {id} = req.params;

        const task = await Task.findById(id);
        if (!task) {
            req.flash("error", "Task not found.");
            return res.redirect("/list");
        }

        await User.findByIdAndUpdate(task.user, {$pull: {tasks: task._id}});
        await Task.findByIdAndDelete(id);

        req.flash("success", "Task deleted successfully!");
        res.redirect("/list");
    } catch (error) {
        console.error("Error deleting task:", error);
        req.flash("error", "Failed to delete task.");
        res.redirect("/list");
    }
};

// Get All Tasks of a Specific User
module.exports.getTasksByUser = async (req, res) => {
    try {
        const {userId} = req.params;
        const user = await User.findById(userId).populate("tasks");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/list");
        }

        res.render("task/list", {tasks: user.tasks, user});
    } catch (error) {
        console.error("Error fetching user's tasks:", error);
        req.flash("error", "Could not fetch tasks for the user.");
        res.redirect("/list");
    }
};

