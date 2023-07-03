import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isMember: {
    type: Boolean,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
});

UserSchema.virtual("settingsUrl").get(function () {
  return `/settings/${this._id}`;
});

module.exports = mongoose.model("user", UserSchema);
