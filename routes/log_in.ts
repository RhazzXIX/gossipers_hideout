import express from "express";

// Create router.
const router = express.Router();
const userController = require("../controllers/userController");

// GET request for user sign-up.
router.get("/", userController.log_in_get);

// Post request for user sign-up.
router.post("/", userController.log_in_post);

module.exports = router;
