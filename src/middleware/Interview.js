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

  category: {
    type: String
  },

  answers: [
    {
      question: String,
      answer: String
    }
  ],

  score: {
    type: Number
  },

  feedback: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Interview", interviewSchema);