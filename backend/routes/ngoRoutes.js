const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { loginNgo, registerNgo } = require("../controllers/authController");

const router = express.Router();

router.post("/register", asyncHandler(registerNgo));
router.post("/login", asyncHandler(loginNgo));

module.exports = router;
