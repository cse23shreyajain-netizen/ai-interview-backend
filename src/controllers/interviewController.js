const Groq = require("groq-sdk");
const Session = require("../models/Session");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────
// Helper function to call Groq AI
// ─────────────────────────────────────────
async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
  });

  return completion.choices[0].message.content.trim();
}

// ─────────────────────────────────────────
// START INTERVIEW (Generate AI Questions)
// ─────────────────────────────────────────
async function startInterview(req, res) {
  try {
    const { role, section, userId } = req.body;

    if (!role || !section || !userId) {
      return res
        .status(400)
        .json({ message: "role, section and userId are required" });
    }

    const prompt = `You are an expert technical interviewer.

Generate exactly 5 interview questions for a ${role} in the "${section}" round.

Rules:
- Questions must be relevant
- Questions should increase in difficulty
- No explanations

Return ONLY a valid JSON array of 5 questions like this:

["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

    const text = await callGroq(prompt);

    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);

    if (!match) {
      throw new Error("AI did not return valid JSON");
    }

    const questions = JSON.parse(match[0]);

    const session = await Session.create({
      userId,
      role,
      section,
      questions,
    });

    res.json({
      sessionId: session._id,
      questions,
    });
  } catch (error) {
    console.error("startInterview error:", error.message);

    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────
// EVALUATE ANSWER (AI Scoring)
// ─────────────────────────────────────────
async function evaluateAnswer(req, res) {
  try {
    const { sessionId, question, answer, role, section } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "question and answer are required" });
    }

    const prompt = `You are an expert interview evaluator.

Role: ${role}
Interview Section: ${section}

Question:
"${question}"

Candidate Answer:
"${answer}"

Evaluate the answer.

Return ONLY valid JSON like this:

{
 "score": number between 0 and 100,
 "feedback": "short feedback",
 "idealAnswer": "what a perfect answer would include"
}`;

    const text = await callGroq(prompt);

    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("AI did not return valid JSON");
    }

    const evaluation = JSON.parse(match[0]);

    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        $push: {
          answers: {
            question,
            answer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            idealAnswer: evaluation.idealAnswer,
          },
        },
      });
    }

    res.json(evaluation);
  } catch (error) {
    console.error("evaluateAnswer error:", error.message);

    res.status(500).json({
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
}

// ─────────────────────────────────────────
// COMPLETE INTERVIEW SESSION
// ─────────────────────────────────────────
async function completeSession(req, res) {
  try {
    const { sessionId } = req.body;

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { completed: true },
      { new: true }
    );

    res.json({
      totalScore: session.totalScore,
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete session",
    });
  }
}

// ─────────────────────────────────────────
// GET USER INTERVIEW HISTORY
// ─────────────────────────────────────────
async function getHistory(req, res) {
  try {
    const { userId } = req.params;

    const sessions = await Session.find({
      userId,
      completed: true,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
}

module.exports = {
  startInterview,
  evaluateAnswer,
  completeSession,
  getHistory,
};