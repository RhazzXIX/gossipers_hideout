import express from "express";

const userController = require("../controllers/userController");
const router = express.Router();

// GET logout user.
router.get("/log-out", userController.user_logout_get);

/* GET user settings */
router.get("/:userId", userController.user_settings_get);

// POST member application
router.post("/:userId/application", userController.user_application_post);

module.exports = router;
