import { waitForClientReady } from "../config/whatsappClientConfig.js";
import {
  createGroupFromDB,
  createNewParticipant,
  createNewSession,
  getAllGroupsFromDB,
  getAllParticipantsFromDB,
  getAllSessionsFromDB,
  markSessionCompleted,
  removeSessionFromDB,
  updateSessionFromDB,
} from "../entities/sessionModels.js";
import { createWhatsappGroup } from "../service/session/createWhatsappGroup.js";
import handleSendPoster from "../service/session/handleSendPoster.js";
import { scheduleSingleSession } from "../service/session/initializeScheduledSessions.js";

export const sendSession = async (req, res) => {
  try {
    await waitForClientReady();
    const sessionData = req.body;
    const createdBy = req.user.id; // Assuming req.user.id is populated by authentication middleware
    const isNewSessionData = sessionData?.id;
    let newSession;
    if (!isNewSessionData) {
      newSession = await createNewSession(sessionData, createdBy); // Await createNewSession if it's async
    }
    await handleSendPoster(sessionData);
    await markSessionCompleted(); // Ensure this is awaited if it's async
    return res.status(201).json(newSession.id); // 201 Created for new resource
  } catch (error) {
    console.error("Error in sendSession controller:", error);
    res
      .status(500)
      .json({ error: error.message || "❌ Failed to send session." });
  }
};

export const scheduleSession = async (req, res) => {
  try {
    const sessionData = req.body;
    const createdBy = req.user.id;
    const newSession = await createNewSession(sessionData, createdBy);

    await scheduleSingleSession(newSession);

    return res.status(201).json(newSession);
  } catch (error) {
    console.error("❌ Error in scheduleSession controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to schedule session.",
    });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const allSession = await getAllSessionsFromDB();
    return res.status(200).json(allSession);
  } catch (error) {
    console.error("Error in getAllSessions controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to fetch sessions.",
    });
  }
};

export const removeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const deletedCount = await removeSessionFromDB(sessionId);

    if (deletedCount === 0) {
      console.warn(
        `Attempted to delete non-existent session with ID: ${sessionId}`
      );
      return res
        .status(404)
        .json({ error: `Session with ID ${sessionId} not found.` });
    }

    console.log(
      `Session with ID ${sessionId} successfully deleted. Deleted count: ${deletedCount}`
    );
    return res.status(204).send(); // 204 No Content for successful DELETE
  } catch (error) {
    console.error("Error in removeSession controller:", error);
    return res.status(500).json({
      error:
        error.message ||
        "❌ An unexpected error occurred while removing the session.",
    });
  }
};

export const updateSession = async (req, res) => {
  try {
    const sessionData = req.body;
    const { sessionId } = req.params;

    const updatedSession = await updateSessionFromDB(sessionId, sessionData);

    if (!updatedSession) {
      // Assuming updateSessionFromDB returns null or false if not found
      console.warn(
        `Attempted to update non-existent session with ID: ${sessionId}`
      );
      return res
        .status(404)
        .json({ error: `Session with ID ${sessionId} not found for update.` });
    }

    return res.status(200).json(updatedSession); // 200 OK for successful update
  } catch (error) {
    console.error("Error in updateSession controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to update session.",
    });
  }
};

export const addParticipant = async (req, res) => {
  try {
    const data = req.body;
    const createdBy = req.user.id; // Assuming req.user.id is populated by authentication middleware
    const newParticipant = await createNewParticipant(data, createdBy);
    return res.status(201).json(newParticipant); // 201 Created for new resource
  } catch (error) {
    console.error("Error in addParticipant controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to add participant.",
    });
  }
};

export const getAllParticipants = async (_, res) => {
  try {
    const allParticipants = await getAllParticipantsFromDB();
    return res.status(200).json(allParticipants); // 200 OK for successful retrieval
  } catch (error) {
    console.error("Error in getAllParticipants controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to fetch participants.",
    });
  }
};

export const createNewGroup = async (req, res) => {
  try {
    const data = req.body;
    console.log("data",data)
    await createWhatsappGroup(data); // Ensure this is awaited if it's async
    const newGroup = await createGroupFromDB(data);
    return res.status(201).json(newGroup); // 201 Created for new resource
  } catch (error) {
    console.error("Error in createNewGroup controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to create new group.",
    });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const allGroups = await getAllGroupsFromDB();
    return res.status(200).json(allGroups); // 200 OK for successful retrieval
  } catch (error) {
    console.error("Error in getAllGroups controller:", error);
    return res.status(500).json({
      error: error.message || "❌ Failed to fetch groups.",
    });
  }
};
