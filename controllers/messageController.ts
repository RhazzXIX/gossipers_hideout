import { Handler } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Message from "../models/message";

const messageController = {
  // Get message list
  message_list: asyncHandler(async function (req, res, next) {
    // Messages storage.
    let messages;
    // Check if the user is a member.
    if (req.user && req.user.isMember) {
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
  }),
  // Handle post message GET req.
  message_post_get: function (req, res, next) {
    // If user is not logged in, redirect to index.
    if (!req.user) res.redirect("/");
    // Render form
    res.render("post_message", {
      title: "Post message",
    });
  } as Handler,
};

export default messageController;
