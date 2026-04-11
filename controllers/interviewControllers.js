import InterviewQuestion from "../models/InterviewQuestion.js";
import InterviewSession from "../models/InterviewSession.js";
import {
  formGenerateQuestions,
  resumeGenerateQuestions,
} from "../service/interview/interviewServices.js";
import parsePdfBuffer from "../service/interview/pdfTextExtracter.js";

export const formGenerateQuestionsController = async (req, res) => {
  try {
    const formData = req.body;
    const userId = req.user.id;
    // Basic validation
    const { domain, type, experience, timer, questionAmount, level } = formData;

    if (
      !domain ||
      !type ||
      !experience ||
      !timer ||
      !questionAmount ||
      !level
    ) {
      throw new Error("All fields required to start interview.");
    }

    const newMockSession = await InterviewSession.create({
      createdBy: userId,
      userId,
      type: "form",
      formData,
    });

    const questions = await formGenerateQuestions(formData);
    console.log("questions : ", questions);
    let newInterviewQuestions = questions.map((questionText, index) => ({
      sessionId: newMockSession.id,
      questionText,
      order: index + 1,
    }));
    const createdQuestions = await InterviewQuestion.bulkCreate(
      newInterviewQuestions
    );
    const newQuestions = createdQuestions.map((questionText) => ({
      id: questionText.id,
      questionText: questionText.questionText,
    }));

    if (newQuestions.length === 0) {
      return res.status(500).json({ error: "No questions generated" });
    }

    return res.status(200).json({
      questions: newQuestions,
      sessionId: newMockSession.id,
      timer : newMockSession?.formData.timer
    });
  } catch (error) {
    console.error("Error in formGenerateQuestionsController:", error.message);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
};

export const resumeGenerateQuestionsController = async (req, res) => {
  try {
    const file = req.file;
    const { type, questionAmount, level, timer } = req.body;

    const userId = req?.user?.id;
    console.log("body", body);
    if (!file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const extractedText = await parsePdfBuffer(file.buffer);
    if (!extractedText) {
      return res.status(400).json({ error: "Could not Extract a PDF" });
    }

    const payload = {
      formData: {
        type,
        questionAmount,
        level,
        timer,
      },
      createdBy: userId,
      userId,
      type: "resume",
      resumeText: extractedText,
    };
    const newMockSession = await InterviewSession.create(payload);
    const questions = await resumeGenerateQuestions(extractedText, body);

    let newInterviewQuestions = questions.map((questionText, index) => ({
      sessionId: newMockSession.id,
      questionText,
      order: index + 1,
    }));
    const createdQuestions = await InterviewQuestion.bulkCreate(
      newInterviewQuestions
    );
    const newQuestions = createdQuestions.map((questionText) => ({
      id: questionText.id,
      questionText: questionText.questionText,
    }));

    if (newQuestions.length === 0) {
      return res.status(500).json({ error: "No questions generated" });
    }

    return res.status(200).json({
      questions: newQuestions,
      sessionId: newMockSession.id,
      timer: newMockSession?.formData.timer,
    });

    return res.status(200).json(questions);
  } catch (error) {
    console.error("Error in resumeGenerateQuestionsController:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to generate questions from resume" });
  }
};
export const getInterviewSessionCOntroller = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is Empty" });
    }

    const isExist = await InterviewSession.findOne({
      where: { id: sessionId },
    });
    if (!isExist) {
      return res.status(404).json({ error: "No session found" });
    }
    const questions = await InterviewQuestion.findAll({
      where: { sessionId },
      attributes: ["questionText"],
      order: [["order", "ASC"]],
    });
    return res.status(200).json({
      questions,
      domain: isExist.formData?.domain || null,
    });
  } catch (error) {
    console.error("Error in getInterviewSessionCOntroller:", error.message);
    return res.status(500).json({ error: "Failed to get questions " });
  }
};

export const getRecommededMocksController = async (req, res) => {
  try {
    const recommendedMocks = await InterviewSession.findAll({
      where: {
        type: "form", // or "resume" depending on user preferencer
        formData: {
          level: "Beginner",
        },
      },
      limit: 6, // number of cards to show
      order: [["createdAt", "DESC"]],
    });
    if (!recommendedMocks) {
      return res.status(404).json({ error: "No Recommended Mocks" });
    }
    return res.status(200).json({
      data: recommendedMocks,
    });
  } catch (error) {
    console.error("Error in getInterviewSessionCOntroller:", error.message);
    return res.status(500).json({ error: "Failed to get questions " });
  }
};
export const getYourMocksController = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "User id is Empty" });
    }

    const myMocks = await InterviewSession.findAll({
      where: { createdBy: userId },
    });
    if (!myMocks) {
      return res.status(404).json({ error: "No Mocks found" });
    }

    return res.status(200).json({
      data: myMocks,
    });
  } catch (error) {
    console.error("Error in getInterviewSessionCOntroller:", error.message);
    return res.status(500).json({ error: "Failed to get questions " });
  }
};



// Update timer
export const updateTimer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body; // seconds elapsed from frontend
    const session = await InterviewSession.findByPk(sessionId);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.timeSpent = timeSpent;
    await session.save();

    res.json({ message: 'Timer updated', timeSpent: session.timeSpent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Complete interview
export const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { timeSpent } = req.body;
    const session = await InterviewSession.findByPk(sessionId);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.endTime = new Date();
    session.status = 'completed';
    session.timeSpent = timeSpent || session.timeSpent;
    await session.save();

    res.json({ message: 'Interview completed', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};