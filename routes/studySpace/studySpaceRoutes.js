import express from 'express';

const router = express.Router();
import protectRoute from '../../middleware/protectRoute.js';
import authorize from '../../middleware/authorize.js';
import {  checkStudySpaceController ,joinStudySpaceController, fetchStudySpaceRequestsController,getOneStudySpaceController,createStudySpaceController, getAllStudySpaceController, approveJoinRequestController, getStudySpacAdminController, exitStudySpaceController, getAllPublicStudySpaceController, getTeacherAllStudySpaces, getAllStudySpaceMembers, getInviteCodeController } from '../../controllers/studySpaceController.js';

router.post('/create',protectRoute,authorize(['admin','teacher']),createStudySpaceController)
router.post('/join',protectRoute,authorize(['user']),joinStudySpaceController)
router.get('/requests/:spaceId',protectRoute,authorize(['admin','teacher']),fetchStudySpaceRequestsController);
router.get('/getAll', protectRoute,getAllStudySpaceController)
router.get('/getAll/public', protectRoute,getAllPublicStudySpaceController)
router.get('/getAll/teacher', protectRoute,authorize(['teacher']),getTeacherAllStudySpaces)
router.get('/getAll/members', protectRoute,authorize(['teacher']),getAllStudySpaceMembers)
router.get('/fetch', protectRoute,getOneStudySpaceController)
router.get('/get-adminId/:spaceId', protectRoute,getStudySpacAdminController)
router.get('/:spaceId', protectRoute,checkStudySpaceController)
router.get('/getInvitecode/:spaceId', protectRoute,getInviteCodeController)
router.delete('/exit-space/:spaceId',protectRoute,exitStudySpaceController)

router.patch('/requests/:requestId/approve', protectRoute,authorize(['admin','teacher']),approveJoinRequestController);
// router.patch('/requests/:requestId/reject', protectRoute,rejectJoinRequestController);
// pending we ill do in feature
// router.get('/fetch-members/:spaceId', protectRoute,fetchMembersController)
// post


export default router;