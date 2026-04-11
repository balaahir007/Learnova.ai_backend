import express from 'express'
import protectRoute from '../../middleware/protectRoute.js';
import { fetchAllMeetController, fetchMeetController } from '../../controllers/meetController.js';
const router = express.Router()

router.get('/getMeets/:spaceId',fetchAllMeetController)
router.get('/:meetId',fetchMeetController)

export default router;