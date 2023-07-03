import express from "express";

// Create router.
const router = express.Router();
const userController = require("../controllers/userController");

// GET request for user sign-up.
router.get("/", userController.sign_up_get);

// Post request for user sign-up.
router.post("/", userController.sign_up_post);

module.exports = router;
