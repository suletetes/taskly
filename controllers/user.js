const User = require("../model/user");
const Task = require("../model/task");

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
        const {fullname, username, email, avatar} = req.body;

        const newUser = new User({fullname, username, email, avatar});
        await newUser.save();

        req.flash("success", "User created successfully!");
        res.redirect(`/user/${newUser._id}`);
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash("error", "Failed to create user.");
        res.redirect("/user/signup");
    }
};

// Get All Users
/*
module.exports.getAllUsers = async (req, res) => {
    try {
        // Default values for pagination
        const perPage = 10; // Number of users per page
        const page = parseInt(req.query.page) || 1; // Current page, defaults to page 1

        // Fetch the total count of users in the database
        const totalUsers = await User.countDocuments();

        // Fetch the users for the current page
        const users = await User.find()
            .populate("tasks", "title") // Adjust as needed for your data
            .skip((page - 1) * perPage) // Skip the previous pages
            .limit(perPage); // Limit the results to the perPage count

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / perPage);

        // Render the view and pass all required variables
        res.render("user/index", {
            users,
            currentPage: page,
            totalPages,
            title: "Users | Taskly",
            hideNavbar: false,
            hideFooter: false
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        req.flash("error", "Unable to fetch users.");
        res.redirect("/");
    }
};
*/

// Get a Single User by ID
module.exports.getUserById = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).populate("tasks");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/users");
        }

        res.render("user/show", {user});
    } catch (error) {
        console.error("Error fetching user:", error);
        req.flash("error", "Could not retrieve user.");
        res.redirect("/users");
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

// Get All Users in Paginated Form
module.exports.getPaginatedUsers = async (req, res) => {
    try {
        const perPage = 10; // Number of users per page
        const page = parseInt(req.query.page) || 1; // Get the page number from query, default to 1

        // Get total user count
        const totalUsers = await User.countDocuments();

        // Fetch users for the current page
        const users = await User.find()
            .populate("tasks", "title")
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalPages = Math.ceil(totalUsers / perPage);

        // Render the paginated user list
        res.render("user/index", {
            users,
            currentPage: page,
            totalPages,
            title: "Users | Taskly",
            hideNavbar: false,
            hideFooter: false,
        });
    } catch (error) {
        console.error("Error fetching paginated users:", error);
        req.flash("error", "Unable to fetch users.");
        res.redirect("/");
    }
};