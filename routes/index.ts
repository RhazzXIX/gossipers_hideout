import express from "express";
import messageController from "../controllers/messageController";
const router = express.Router();

/* GET home page. */
router.get("/", messageController.message_list);

module.exports = router;
