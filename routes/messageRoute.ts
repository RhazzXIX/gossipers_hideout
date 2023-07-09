import express from "express";

const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/post", messageController.message_post_get);

export default router;
