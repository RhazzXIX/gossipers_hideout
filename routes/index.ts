import express from "express";
const router = express.Router();

const messageController = require("../controllers/messageController");

/* GET home page. */
router.get("/", messageController.message_list);

module.exports = router;
