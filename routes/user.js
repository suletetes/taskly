const express = require("express");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserTasks,
    getPaginatedUsers,
    renderNewUserForm
} = require("../controllers/user");
const {isLoggedIn, validateUser, isUserExists} = require("../middleware");

const router = express.Router();



// Define the paginated route before the dynamic :id route
router.get("/paginated", getPaginatedUsers);

// Routes
router.get("/new",  renderNewUserForm); // Ensures user is logged in before access
router.post("/", validateUser, createUser);
// router.get("/", getAllUsers);
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