import { Handler } from "express";
import { ValidationError, body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import passport from "../config/authentication";

const User = require("../models/user");

declare module "express-session" {
  interface Session {
    messages?: string[];
  }
}

// Handle user sign-up GET request
module.exports.sign_up_get = function (req, res, next) {
  res.render("user_form", {
    title: "Sign up to post messages",
  });
} as Handler;

// Handle user sign-up POST request.
module.exports.sign_up_post = [
  // Form validations and sanitization.
  body("username", "Username should have at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("password").trim().escape(),
  body("confirm_password", "Password and confirmation does not match")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .escape(),
  // Handle request.
  asyncHandler(async function (req, res, next) {
    // Storage for errors
    const errors: ValidationError | { msg: string }[] = [];
    // Check if user exists and add to errors.
    const userExists = await User.findOne({ name: req.body.username }).exec();
    if (userExists) errors.push({ msg: "Username already exists" });

    // Check if there are validation errors and add to errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
      validationErrors.array().forEach((error) => errors.push(error));

    // Sign up user if there are no errors.
    if (errors.length <= 0) {
      // Password hashing.
      bcrypt.hash(req.body.password, 10, async function (err, hashedPassword) {
        // Handle password hashing error
        if (err) return next(err);

        // Create user & save
        const user = new User({
          name: req.body.username,
          password: hashedPassword,
          isMember: false,
          isAdmin: false,
        });
        await user.save();
        next();
      });
    } else {
      // Re-render sign up form if there are errors
      res.render("user_form", {
        title: "Sign-up to post messages",
        errors,
        username: req.body.username,
      });
    }
  }),

  // Log in user after sign-up
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
];

// Handle Log in GET Request
module.exports.log_in_get = function (req, res, next) {
  // Storage for errors from authentication.
  const errors: { msg: string }[] = [];
  // If there are errors from authentication.
  if (req.session.messages && req.session.messages.length > 0) {
    req.session.messages.forEach((message) => {
      errors.push({ msg: message });
    });
  }
  // Delete session messages.
  delete req.session.messages;
  // Render form.
  res.render("user_form", {
    title: "Log in to post messages",
    toLogIn: true,
    errors: errors.length <= 0 ? null : errors,
  });
} as Handler;

// Handle Log in POST Request.
module.exports.log_in_post = [
  // Validate and sanitize.
  body("username", "Invalid username").trim().isLength({ min: 3 }).escape(),
  body("password", "Invalid password").trim().escape(),
  // Re-render form if there are errors.
  asyncHandler(async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("user_form", {
        title: "Log in",
        username: req.body.username,
        errors: errors.array(),
      });
    }
    next();
  }),
  // Authenticate user.
  passport.authenticate("local", {
    successRedirect: "/",
    failureMessage: true,
    failureRedirect: "/log-in",
  }),
];
