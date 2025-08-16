import mongoose, { Schema, Document } from "mongoose";
import { ParticipantProfile } from "../../types";

interface IProfile extends Omit<ParticipantProfile, "id">, Document {}

const ProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  title: { type: String },
  location: { type: String },
  website: { type: String },
  github: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
  skills: [{ type: String }],
  experience: { type: String },
  education: {
    degree: { type: String },
    institution: { type: String },
    graduationYear: { type: String },
  },
  achievements: [{ type: String }],
  projects: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      technologies: [{ type: String }],
      githubUrl: { type: String },
      liveUrl: { type: String },
      imageUrl: { type: String },
    },
  ],
  hackathonsWon: { type: Number, default: 0 },
  totalParticipations: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

// Update the updatedAt field before saving
ProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

export default mongoose.model<IProfile>("Profile", ProfileSchema);
