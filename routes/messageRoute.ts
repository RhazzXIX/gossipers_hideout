import express from "express";
import messageController from "../controllers/messageController";
const router = express.Router();

router.get("/post", messageController.post_message_get);

router.post("/post", messageController.post_message_post);

router.get("/delete/:messageId", messageController.delete_message);

export default router;
