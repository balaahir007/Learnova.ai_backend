import express from "express";
import multer from "multer";
import protectRoute from "../middleware/protectRoute.js";
import { addParticipant, createNewGroup, getAllGroups, getAllParticipants, getAllSessions, removeSession, scheduleSession, sendSession, updateSession } from "../controllers/sessionControllers.js";
// const storage = multer.memoryStorage(); // or diskStorage with destination
const upload = multer({ storage: multer.memoryStorage() }); // or use diskStorage
const router = express.Router();



router.post("/send-session",protectRoute,sendSession);
router.post("/schedule-session",protectRoute,scheduleSession);
router.get('/fetchAll-session',protectRoute,getAllSessions)
router.delete('/remove/:sessionId',protectRoute,removeSession)
router.put('/update/:sessionId',protectRoute,updateSession)


router.post('/add-participant',protectRoute,addParticipant)
router.get('/fetchAll-participant',protectRoute,getAllParticipants)
router.post('/create-group',protectRoute,createNewGroup)
router.get('/getAll-groups',protectRoute,getAllGroups)

export default router;
