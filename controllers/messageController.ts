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
  post_message_get: function (req, res, next) {
    // If user is not logged in, redirect to index.
    if (!req.user) res.redirect("/");
    // Render form
    res.render("post_message", {
      title: "Post message",
    });
  } as Handler,
  post_message_post: [
    // Validate and sanitize.
    body("title", "Message title should have at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("text", "Message text should have at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    asyncHandler(async function (req, res, next) {
      // Check if user is logged in.
      if (req.user) {
        // Validation errors.
        const errors = validationResult(req);
        // If errors is not empty handle post request.
        if (errors.isEmpty()) {
          // Create a message document.
          const message = new Message({
            title: req.body.title,
            text: req.body.text,
            fromUser: req.user._id,
            date: new Date(),
          });
          // Save message to database.
          await message.save();
          // Redirect to homepage.
          res.redirect("/");
        } else {
          // If there are errors re-render page with errors.
          res.render("post_message", {
            title: "Post Message",
            errors: errors.array(),
          });
        }
      } else {
        // If user is not logged in redirect to homepage.
        res.redirect("/");
      }
    }),
  ],
  delete_message: asyncHandler(async function (req, res, next) {
    // check if user is admin and the req params is a valid id.
    if (
      req.user &&
      req.user.isAdmin &&
      mongoose.isValidObjectId(req.params.messageId)
    ) {
      await Message.findByIdAndDelete(req.params.messageId).exec();
      res.redirect("/");
    } else {
      // Redirect to home page if not.
      res.redirect("/");
    }
  }),
};

export default messageController;
