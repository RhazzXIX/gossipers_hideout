import { Handler } from "express";
import asyncHandler from "express-async-handler";

const User = require("../models/user");

// Handle user sign-up GET request
module.exports.sign_up_get = function (req, res, next) {
  res.render("sign_up", {
    title: "Sign up",
  });
} as Handler;

//  Handle user sign-up POST request
