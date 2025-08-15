import mongoose from "mongoose";
import { Hackathon } from "../../types";

// Create a participant schema
const ParticipantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  college: { type: String },
  university: { type: String },
  skills: [{ type: String }],
  experience: { type: String },
  teamName: { type: String },
  teammates: [{ type: String }],
  submissionDate: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "not_required"],
    default: "not_required",
  },
  paymentId: { type: String },
  projectSubmission: {
    githubLink: { type: String },
    projectDescription: { type: String },
    submissionDate: { type: Date },
    evaluation: {
      score: { type: Number },
      feedback: { type: String },
      metrics: {
        innovation: { type: Number },
        technicalComplexity: { type: Number },
        codeQuality: { type: Number },
        userExperience: { type: Number },
        documentation: { type: Number },
        scalability: { type: Number },
        maintainability: { type: Number },
      },
      strengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      recommendations: [{ type: String }],
      evaluatedBy: { type: String },
      evaluatedAt: { type: Date },
    },
    ranking: {
      rank: { type: Number },
      score: { type: Number },
      feedback: { type: String },
      rankedAt: { type: Date },
    },
  },
});

// Create a hackathon schema
const HackathonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    registrationDeadline: { type: String, required: true },
    organizerName: { type: String, default: "" },
    category: { type: String, required: true },
    location: { type: String, default: "" },
    image: {
      type: String,
      default: "https://via.placeholder.com/800x400?text=Hackathon",
    },
    prizes: { type: String, default: "TBA" },
    teamSize: { type: String, default: "1-5" },
    registrationFee: { type: String, default: "Free" },
    website: { type: String, default: "" },
    creatorId: { type: String, required: true },
    featured: { type: Boolean, default: false },
    participants: [ParticipantSchema],
    upiId: { type: String, default: "" },
    paymentRequired: { type: Boolean, default: false },
    rules: { type: [String], default: [] },
    prizeDetails: { type: [Object], default: [] },
    timeline: { type: [Object], default: [] },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
export default mongoose.model<Hackathon & mongoose.Document>(
  "Hackathon",
  HackathonSchema
);
