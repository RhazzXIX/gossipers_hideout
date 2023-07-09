import express from "express";
import messageController from "../controllers/messageController";
const router = express.Router();

router.get("/post", messageController.message_post_get);

export default router;
