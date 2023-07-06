import express from "express";

const router = express.Router();

/* GET users listing. */
router.get("/:userId", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
