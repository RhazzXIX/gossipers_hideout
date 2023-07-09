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
    ref: "user",
  },
});

MessageSchema.virtual("deleteUrl").get(function () {
  return `/message/delete/${this._id}`;
});

const Message = mongoose.model("message", MessageSchema);

export default Message;
