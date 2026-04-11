import { createAssignmentService, deleteAssignmentService, getAssignmentByIdService, getCourseAssignmentsService, getSubmissionResultsService, startAssignmentService, submitAssignmentService, updateAssignmentService } from "../service/assignmentService.js";

export const createAssignment = async (req, res) => {
  try {
    const assignment = await createAssignmentService(req.body, req.user.id);
    res.status(201).json({ message: "Assignment created", data: assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourseAssignments = async (req, res) => {
  try {
    const assignments = await getCourseAssignmentsService(req.params.courseId, req.user.id);
    res.status(200).json({ message: "Assignments fetched", data: assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await getAssignmentByIdService(req.params.assignmentId, req.user.id);
    res.status(200).json({ message: "Assignment fetched", data: assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const startAssignment = async (req, res) => {
  try {
    const submission = await startAssignmentService(req.params.assignmentId, req.user.id);
    res.status(201).json({ message: "Assignment started", data: submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const result = await submitAssignmentService(req.params.assignmentId, req.user.id, req.body.answers, req.body.timeSpent);
    res.status(200).json({ message: "Assignment submitted", data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubmissionResults = async (req, res) => {
  try {
    const submission = await getSubmissionResultsService(req.params.submissionId, req.user.id);
    res.status(200).json({ message: "Submission results", data: submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await updateAssignmentService(req.params.assignmentId, req.body);
    res.status(200).json({ message: "Assignment updated", data: assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    await deleteAssignmentService(req.params.assignmentId);
    res.status(200).json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
