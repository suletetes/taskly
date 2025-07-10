const express = require("express");
const {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    showAllUsers,
    renderNewUserForm,
} = require("../controllers/user");
const { isLoggedIn, validateUser, isUserExists } = require("../middleware");

const router = express.Router();

// Static Routes
router.get("/new", renderNewUserForm); // Static route for creating a new user
router.get("/", showAllUsers); // Paginated users route

// Dynamic Routes
router.get("/:id", isUserExists, getUserById);
router.put("/:id", isUserExists, validateUser, updateUser);
router.delete("/:id", isUserExists, deleteUser);


/*

// Routes
// router.get("/paginated", isLoggedIn, getPaginatedUsers);
// router.get("/paginated",  getPaginatedUsers);
router.post("/", validateUser, createUser);
// router.get("/", isLoggedIn, getAllUsers);
router.get("/", getAllUsers);
// router.get("/:id", isLoggedIn, isUserExists, getUserById);
router.get("/:id", isUserExists, getUserById);
// router.put("/:id", isLoggedIn, isUserExists, validateUser, updateUser);
router.put("/:id", isUserExists, validateUser, updateUser);
// router.delete("/:id", isLoggedIn, isUserExists, deleteUser);
router.delete("/:id", isUserExists, deleteUser);
// router.get("/:id/tasks", isLoggedIn, isUserExists, getUserTasks);
*/

module.exports = router;