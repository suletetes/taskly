const User = require("../model/user");
const Task = require("../model/task");
const userTaskStats = require("./calculateProductivityStats");

// Render 'New User' Form
module.exports.renderNewUserForm = async (req, res) => {
    try {
        res.render("auth/signup", {
            title: 'Add User | Taskly',
            hideNavbar: true,
            hideFooter: true
        }); // Render a form to create a new user
    } catch (error) {
        console.error("Error rendering user form:", error);
        req.flash("error", "Could not load user creation form.");
        res.redirect("/user/users");
    }
};

// Create a New User
module.exports.createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { fullname, username, email, avatar, password } = req.body;

        // Create a new user instance (without saving it yet)
        const newUser = new User({ fullname, username, email, avatar });

        // Use the `register` method to hash and save the password along with the user
        const registeredUser = await User.register(newUser, password);

        req.flash("success", "User created successfully!");
        res.redirect(`/users/${registeredUser._id}`);
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash("error", "Failed to create user.");
        res.redirect("/users/signup");
    }
};

// Render Login Form
module.exports.renderLoginForm = async (req, res) => {
    try {
        res.render("auth/login", {
            title: "Login | Taskly",
            hideNavbar: true,
            hideFooter: true,
        });
    } catch (error) {
        console.error("Error rendering login form:", error);
        req.flash("error", "Could not load login page.");
        res.redirect("/");
    }
};

// Render Edit User Form
module.exports.renderEditUserForm = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        res.render("user/edit", {
            user, title: 'Edit User | Taskly',
            hideNavbar: true,
            hideFooter: true
        });
    } catch (error) {
        console.error("Error rendering user edit form:", error);
        req.flash("error", "Could not load user edit form.");
        res.redirect("/user/users");
    }
};

// Update a User by ID
module.exports.updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        req.flash("success", "User updated successfully!");
        res.redirect(`/users/${id}`);
    } catch (error) {
        console.error("Error updating user:", error);
        req.flash("error", "Could not update user.");
        res.redirect(`/users/${id}/edit`);
    }
};

// Delete a User by ID
module.exports.deleteUser = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await User.findById(id);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        // Delete all tasks for this user
        await Task.deleteMany({user: id});

        await User.findByIdAndDelete(id);

        req.flash("success", "User deleted successfully!");
        res.redirect("/user/users");
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash("error", "Failed to delete user.");
        res.redirect("/users");
    }
};

// user profile by ID
module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user and populate their tasks
        const user = await User.findById(id).populate("tasks");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        // Calculate productivity stats
        const stats = await userTaskStats.calculateProductivityStats(id);

        // Evaluate dynamic status for each task
        const tasks = user.tasks.map(task => {
            const now = new Date();
            const dueDate = task.due;
            let dynamicStatus = task.status;

            if (dynamicStatus === "in-progress") {
                dynamicStatus = dueDate < now ? "failed" : "in-progress";
            }

            return {
                ...task._doc,
                dynamicStatus
            };
        });

        // Render the user's profile with tasks and stats
        res.render("user/show", {
            user,
            stats,
            tasks,
            title: "User Profile | Taskly",
            hideNavbar: false,
            hideFooter: false,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        req.flash("error", "Could not retrieve user.");
        res.redirect("/users");
    }
};

// Get All Users in Paginated Form
module.exports.showAllUsers = async (req, res) => {
    try {
        const perPage = 12; // Number of users per page
        const page = Math.max(1, parseInt(req.query.page, 10) || 1); // Ensure a positive page number

        // Get total user count
        const totalUsers = await User.countDocuments();

        // Fetch users for the current page
        const users = await User.find()
            .populate("tasks", "title due status") // Populate necessary task fields
            .skip((page - 1) * perPage)
            .limit(perPage);

        // Calculate stats for each user
        const usersWithStats = await Promise.all(users.map(async user => {
            const stats = await userTaskStats.calculateProductivityStats(user._id);
            const totalTasks = user.tasks.length;
            return {
                ...user.toObject(),
                stats,
                totalTasks,
                created_at: user.created_at
            };
        }));

        const totalPages = Math.ceil(totalUsers / perPage);

        // If no users exist for the current page, redirect to the last page
        if (!usersWithStats.length && page > 1) {
            req.flash("error", "Requested page doesn't exist.");
            return res.redirect(`/users?page=${totalPages}`);
        }

        res.render("user/index", {
            users: usersWithStats, // Include users with calculated stats
            currentPage: page,
            totalPages,
            totalUsers,
            title: "All Users | Taskly",
            hideNavbar: false,
            hideFooter: false,
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        req.flash("error", "Unable to fetch users.");
        res.redirect("/");
    }
};