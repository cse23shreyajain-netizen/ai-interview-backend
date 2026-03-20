const express = require("express");
const router = express.Router();

const {
  startInterview,
  evaluateAnswer,
  completeSession,
  getHistory
} = require("../controllers/interviewController");

router.post("/start", startInterview);
router.post("/answer", evaluateAnswer);
router.post("/complete", completeSession);
router.get("/history/:userId", getHistory);

module.exports = router;
