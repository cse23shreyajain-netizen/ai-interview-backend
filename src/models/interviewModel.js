const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    required: true
  },

  section: {
    type: String,
    enum: ["technical", "logical", "behavioral"],
    default: "technical"
  },

  technicalQuestions: [String],

  logicalQuestions: [String],

  behavioralQuestions: [String],

  answers: [
    {
      question: String,
      answer: String,
      score: Number,
      feedback: String
    }
  ],

  totalScore: {
    type: Number,
    default: 0
  },

  finalFeedback: {
    type: String
  },

  status: {
    type: String,
    enum: ["started", "completed"],
    default: "started"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Interview", interviewSchema);