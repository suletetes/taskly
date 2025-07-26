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
// Create a New User (with auto-login functionality)
module.exports.createUser = async (req, res, next) => {
    try {
        const {fullname, username, email, avatar, password} = req.body;
        // console.log(req.body);

        // Create a new user instance (without saving it yet)
        const newUser = new User({fullname, username, email, avatar});

        // Use the `register` method to hash and save the password along with the user
        const registeredUser = await User.register(newUser, password);

        // Automatically log the user in after successful registration
        req.login(registeredUser, (err) => {
            if (err) return next(err); // Pass any login errors to the next middleware

            req.flash("success", "User created successfully! Welcome to Taskly!");
            res.redirect(`/users/${registeredUser._id}`);
        });
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash("error", error.message || "Failed to create user.");
        res.redirect("/users/signup");
    }
};
// Render login Form
module.exports.renderLoginForm = async (req, res) => {
    try {
        res.render("auth/login", {
            title: 'Login | Taskly',
            hideNavbar: true,
            hideFooter: true
        }); // Render the login form
    } catch (error) {
        console.error("Error rendering login form:", error);
        req.flash("error", "Could not load the login page.");
        res.redirect("/");
    }
};

// User Login
module.exports.login = async (req, res) => {
    try {
        // Passport automatically attaches `req.user` upon successful authentication
        req.flash("success", `Welcome back, ${req.user.fullname || req.user.username}!`);
        // Redirect to the user's profile page after login
        res.redirect(`/users/${req.user._id}`);
    } catch (error) {
        console.error("Login error:", error);
        req.flash("error", "Unable to log in. Please try again.");
        res.redirect("/users/login");
    }
};

// Handle User Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out successfully.");
        res.redirect("/");
    });
};


// Render Edit User Form
module.exports.renderEditUserForm = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        res.render("user/edit", {
            user,                            // Pass the user data to the view
            // currentUser: user,               // To align with the `currentUser` in the provided HTML code
            title: 'Edit User Settings',
            hideNavbar: true,
            hideFooter: true,
        });
    } catch (error) {
        console.error("Error rendering user edit form:", error);
        req.flash("error", "Could not load user edit form.");
        res.redirect("/users");
    }
};
// Update a User by ID
module.exports.updateUser = async (req, res) => {
    try {
        console.log("req.params:", req.params); // Debug
        console.log("req.body:", req.body); // Debug

        const { userId } = req.params;
        const { fullname, username, new_email, current_password, new_password, avatar } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        // Verify the current password (if provided, for example, if password update is attempted)
        if (current_password && !(await user.authenticate(current_password))) {
            req.flash("error", "Current password is incorrect.");
            return res.redirect(`/users/${userId}/edit`);
        }

        // Update basic details
        if (fullname) user.fullname = fullname;
        if (username) user.username = username;
        if (new_email) user.email = new_email;
        if (avatar) user.avatar = avatar;

        // Update password only if a new one is provided
        if (new_password) {
            await user.setPassword(new_password); // Properly hash the new password
        }

        // Save updated user
        await user.save();

        req.flash("success", "User settings updated successfully!");
        res.redirect(`/users/${userId}`);
    } catch (error) {
        console.error("Error updating user:", error);
        req.flash("error", "Failed to update user. Please try again.");
        res.redirect(`/users/${userId}/edit`);
    }
};

// Delete a User by ID
module.exports.deleteUser = async (req, res) => {
    try {
        const {userId} = req.params;

        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        // Delete all tasks for this user
        await Task.deleteMany({user: userId});

        await User.findByIdAndDelete(userId);

        req.flash("success", "User deleted successfully!");
        res.redirect("/user/users");
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash("error", "Failed to delete user.");
        res.redirect("/users");
    }
};

// user profile by ID
/*module.exports.getUserById = async (req, res) => {
    try {
        const {userId} = req.params;

        // Find the user and populate their tasks
        const user = await User.findById(userId).populate("tasks");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        // Calculate productivity stats
        const stats = await userTaskStats.calculateProductivityStats(userId);

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
};*/
// user profile by ID
// Get User Profile by ID with Paginated Tasks and Stats
module.exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        const perPage = 8;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);

        const totalTasks = await Task.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalTasks / perPage);

        if (page > totalPages && totalPages > 0) {
            return res.redirect(`/users/${userId}?page=${totalPages}`);
        }

        // Fetch paginated tasks
        const rawTasks = await Task.find({ user: userId })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ due: 1 });

        // Evaluate dynamic task status
        const tasks = rawTasks.map(task => {
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

        // Calculate productivity stats
        const stats = await userTaskStats.calculateProductivityStats(userId);

        // Render profile view
        res.render("user/show", {
            user,
            stats,
            tasks,
            title: "User Profile | Taskly",
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
        console.error("Error fetching user profile:", error);
        req.flash("error", "Could not retrieve user profile.");
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