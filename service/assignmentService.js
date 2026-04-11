
import { Assignment, Question, Submission } from "../models/Assignment.js";
import { Course } from "../models/Course.js";


// Create Assignment
export const createAssignmentService = async (data, userId) => {
  const course = await Course.findByPk(data.courseId);
  if (!course) throw new Error("Course not found");

  const assignment = await Assignment.create({
    ...data,
    createdBy: userId
  });

  if (data.questions && data.questions.length) {
    const questions = data.questions.map(q => ({ ...q, assignmentId: assignment.id }));
    await Question.bulkCreate(questions);
  }

  return assignment;
};

// Get all assignments for a course with user's submission status
export const getCourseAssignmentsService = async (courseId, userId) => {
  const assignments = await Assignment.findAll({
    where: { courseId, isPublished: true },
    order: [["createdAt", "DESC"]],
    include: [{ model: Question, as: "questions" }]
  });

  const result = await Promise.all(assignments.map(async (assignment) => {
    const submission = await Submission.findOne({
      where: { assignmentId: assignment.id, userId },
      order: [["attempts", "DESC"]]
    });

    return {
      ...assignment.toJSON(),
      userSubmission: submission ? submission.toJSON() : null
    };
  }));

  return result;
};

// Get assignment by ID
export const getAssignmentByIdService = async (assignmentId, userId) => {
  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: Question, as: "questions" }]
  });

  if (!assignment) throw new Error("Assignment not found");

  const previousSubmission = await Submission.findOne({
    where: { assignmentId, userId },
    order: [["attempts", "DESC"]]
  });

  // Remove correct answers for security
  const sanitizedQuestions = assignment.questions.map(q => {
    const question = { ...q.toJSON() };
    if (question.options) {
      question.options = question.options.map(opt => ({ text: opt.text, id: opt.id }));
    }
    delete question.correctAnswer;
    return question;
  });

  return {
    ...assignment.toJSON(),
    questions: sanitizedQuestions,
    previousSubmission: previousSubmission ? previousSubmission.toJSON() : null
  };
};

// Start assignment attempt
export const startAssignmentService = async (assignmentId, userId) => {
  const assignment = await Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  const previousAttempts = await Submission.count({ where: { assignmentId, userId } });

  const submission = await Submission.create({
    assignmentId,
    userId,
    courseId: assignment.courseId,
    attempts: previousAttempts + 1,
    status: "in-progress"
  });

  return submission;
};

// Submit assignment
export const submitAssignmentService = async (assignmentId, userId, answers, timeSpent) => {
  const assignment = await Assignment.findByPk(assignmentId, { include: [{ model: Question, as: "questions" }] });
  if (!assignment) throw new Error("Assignment not found");

  const submission = await Submission.findOne({
    where: { assignmentId, userId, status: "in-progress" },
    order: [["attempts", "DESC"]]
  });
  if (!submission) throw new Error("No active submission found");

  let totalScore = 0;
  const gradedAnswers = answers.map(userAnswer => {
    const question = assignment.questions.find(q => q.id === userAnswer.questionId);
    if (!question) return userAnswer;

    let isCorrect = false;
    let pointsEarned = 0;

    switch (question.questionType) {
      case "multiple-choice":
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.id === userAnswer.answer;
        break;
      case "true-false":
        isCorrect = question.correctAnswer.toLowerCase() === userAnswer.answer.toLowerCase();
        break;
      case "short-answer":
        isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.answer.toLowerCase().trim();
        break;
      case "essay":
        isCorrect = null; // Manual grading
        break;
    }

    if (isCorrect) {
      pointsEarned = question.points || 1;
      totalScore += pointsEarned;
    }

    return { questionId: userAnswer.questionId, answer: userAnswer.answer, isCorrect, pointsEarned };
  });

  const percentage = (totalScore / assignment.totalPoints) * 100;
  const isPassed = percentage >= assignment.passingScore;

  submission.answers = gradedAnswers;
  submission.totalScore = totalScore;
  submission.percentage = percentage;
  submission.isPassed = isPassed;
  submission.status = "submitted";
  submission.submittedAt = new Date();
  submission.timeSpent = timeSpent;

  await submission.save();
  return { submission, totalScore, percentage, isPassed, totalPoints: assignment.totalPoints, passingScore: assignment.passingScore };
};

// Get submission results
export const getSubmissionResultsService = async (submissionId, userId) => {
  const submission = await Submission.findByPk(submissionId, { include: [Assignment] });
  if (!submission) throw new Error("Submission not found");
  if (submission.userId !== userId) throw new Error("Access denied");

  return submission;
};

// Update assignment
export const updateAssignmentService = async (assignmentId, updates) => {
  const assignment = await Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await assignment.update(updates);
  return assignment;
};

// Delete assignment
export const deleteAssignmentService = async (assignmentId) => {
  const assignment = await Assignment.findByPk(assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await Submission.destroy({ where: { assignmentId } });
  await Question.destroy({ where: { assignmentId } });
  await assignment.destroy();
  return true;
};
