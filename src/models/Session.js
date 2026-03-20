const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Number,
  feedback: String,
  idealAnswer: String,
});

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    section: {
      type: String,
      enum: ["technical", "logical", "behavioral"],
      required: true,
    },
    questions: [String],
    answers: [answerSchema],
    totalScore: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-calculate total score before save
sessionSchema.pre("save", function (next) {
  if (this.answers.length > 0) {
    const sum = this.answers.reduce((acc, a) => acc + (a.score || 0), 0);
    this.totalScore = Math.round(sum / this.answers.length);
  }
  next();
});

module.exports = mongoose.model("Session", sessionSchema);
