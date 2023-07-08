import { Handler } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Message from "../models/message";

// Get message list
module.exports.message_list = asyncHandler(async function (req, res, next) {
  // Messages storage.
  let messages;
  // Check if the user is a member.
  if (req.user?.isMember) {
    // Retrieve all message info if the user is a member.
    messages = await Message.find()
      .populate("fromUser")
      .sort({ date: -1 })
      .exec();
  } else {
    // Limit message info if the user is not a member or not logged-in.
    messages = await Message.find({}, "title text").sort({ date: -1 }).exec();
  }
  // Render the page with the messages.
  res.render("index", {
    title: `Gossiper's hideout`,
    messages,
  });
});
