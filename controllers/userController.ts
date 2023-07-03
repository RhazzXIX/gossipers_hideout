import { Handler } from "express";
import { ValidationError, body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import passport from "../config/authentication";

const User = require("../models/user");

// Handle user sign-up GET request
module.exports.sign_up_get = function (req, res, next) {
  res.render("sign_up", {
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

        // Create user save and log in.
        const user = new User({
          name: req.body.username,
          password: hashedPassword,
          isMember: false,
          isAdmin: false,
        });
        res.locals.currentUser = user;
        await user.save();
        res.redirect('/');
      });
    } else {
      // Re-render sign up form if there are errors
      res.render("sign_up", {
        title: "Sign-up to post messages",
        errors,
        username: req.body.username,
      });
    }
  }),
];

//  Handle user sign-up POST request
