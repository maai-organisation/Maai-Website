const express = require("express");
const {
  claimCertificate,
  downloadCertificate,
  listCertificates,
  previewCertificate,
} = require("../controllers/certificateController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, asyncHandler(listCertificates));
router.post("/:id/claim", requireAuth, asyncHandler(claimCertificate));
router.get("/:id/preview", requireAuth, asyncHandler(previewCertificate));
router.get("/:id/download", requireAuth, asyncHandler(downloadCertificate));

module.exports = router;
