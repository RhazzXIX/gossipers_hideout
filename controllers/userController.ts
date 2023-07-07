import { Handler } from "express";
import { ValidationError, body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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

// Handle User settings GET request
module.exports.user_settings_get = function (req, res, next) {
  // Redirect to index if user is not logged in
  if (!res.locals.currentUser) res.redirect("/");
  // Redirect to user settings if trying to access different user settings.
  if (
    !mongoose.isValidObjectId(req.params.userId) ||
    res.locals.currentUser._id.toString() !== req.params.userId
  )
    return res.redirect(res.locals.currentUser.settingsUrl);
  // Render user settings page.
  res.render("user_settings", {
    title: `Welcome ${res.locals.currentUser.name}`,
  });
} as Handler;

module.exports.user_application_post = [
  // Validation and sanitation
  body("memberCode")
    .trim()
    .notEmpty()
    .withMessage("Code should not be empty")
    // check if user entered the right code.
    .custom((value) => {
      if (value === "$ecretM3mber") {
        return true;
      } else {
        throw new Error("Wrong member code. Check README.md");
      }
    })
    .escape(),
  body("applyForAdmin").trim().escape(),
  // Handle POST req
  asyncHandler(async function (req, res, next) {
    // Check for validation errors.
    const errors = validationResult(req);
    // If there are no errors, handle application request
    if (errors.isEmpty()) {
      // Create an updated user
      const updatedUser = new User({
        _id: res.locals.currentUser._id,
        name: res.locals.currentUser.name,
        password: res.locals.password,
        isMember: true,
        isAdmin: req.body.applyForAdmin === "yes" ? true : false,
      });
      // Update user in database.
      await User.findByIdAndUpdate(res.locals.currentUser._id, updatedUser, {});
      // Log out user to update res.locals.currentUser
      res.redirect("/settings/log-out");
    } else {
      // If there are errors re-render form with errors
      res.render("user_settings", {
        title: `Welcome ${res.locals.currentUser.name}`,
        errors: errors.array(),
      });
    }
  }),
];

module.exports.user_logout_get = function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
} as Handler;
