const express = require("express");
const { login, loginNgo, me, register, registerNgo, updateNgoProfile } = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { getMembershipSettings } = require("../utils/membershipSettings");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/ngo/register", asyncHandler(registerNgo));
router.post("/ngo/login", asyncHandler(loginNgo));
router.get(
  "/membership-settings",
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await getMembershipSettings() });
  }),
);
router.get("/me", requireAuth, asyncHandler(me));
router.patch("/ngo/me", requireAuth, asyncHandler(updateNgoProfile));

module.exports = router;
