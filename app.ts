import express, { ErrorRequestHandler } from "express";
import createError from "http-errors";
import compression from "compression";
import session from "express-session";
import logger from "morgan";
import mongoose, { ConnectOptions } from "mongoose";
import passport from "./config/authentication";
import {} from "./custom-types/extendedGlobal";
import messageRouter from "./routes/messageRoute";
import helmet from "helmet";
import RateLimit from "express-rate-limit";
require("dotenv").config();
const path = require("path");
const indexRouter = require("./routes/index");
const settingsRouter = require("./routes/settings");
const sign_upRouter = require("./routes/sign_up");
const log_inRouter = require("./routes/log_in");

const app = express();
const mongoDb = process.env.MONGODB_URI || "";

const main = async () => {
  await mongoose.connect(mongoDb, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  } as ConnectOptions);
  console.log("Connected to database");
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "Mongo connection error"));
};

main().catch((err) => console.log(err));

// Set up for deployment
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);
app.use(compression());
app.use(helmet());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/settings", settingsRouter);
app.use("/sign-up", sign_upRouter);
app.use("/log-in", log_inRouter);
app.use("/message", messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
} as ErrorRequestHandler);

module.exports = app;
