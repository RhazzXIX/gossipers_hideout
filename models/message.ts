import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  fromUser: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("message", MessageSchema);
