import mongoose from "mongoose";
import { User } from "../../types";

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["host", "participant", "admin"],
      default: "participant",
      required: true,
    },
    avatar: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<User & mongoose.Document>("User", UserSchema);
