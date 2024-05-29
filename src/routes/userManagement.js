// routes/users.js
const express = require("express");
const router = express.Router();
const createUser = require("../controllers/userManagement/CreateUser");
const allUser = require("../controllers/userManagement/Alluser");
const singleUser = require("../controllers/userManagement/singleUser");
const updatedUser = require("../controllers/userManagement/UpdateUser");
const deleteUser = require("../controllers/userManagement/DeleteUser");
const logIn = require("../controllers/userManagement/Login");
const authMiddleware = require("../middleware/authMiddleware");
// Create a new user
router.post('/createuser', authMiddleware, createUser);
// router.post('/createuser', createUser );
// Get all users
router.post('/getallusers', authMiddleware, allUser);

// get single user 
router.post('/getuser', authMiddleware, singleUser);

// updated user
router.post('/updateuser/:id', authMiddleware, updatedUser);

// delete user
router.post('/deleteuser/:id', authMiddleware, deleteUser)

// login user
router.post("/login", logIn);

module.exports = router;
