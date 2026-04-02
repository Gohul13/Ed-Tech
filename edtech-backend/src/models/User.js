// const mongoose = require("mongoose");
import mongoose from "mongoose"; 
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    loginCount: {
      type: Number,
      default: 0 
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;