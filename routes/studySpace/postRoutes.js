import express from 'express'
import protectRoute from '../../middleware/protectRoute.js';
import { addCommentController, addLikesController, createPostController,fetchAllPostsController, fetchPostController } from '../../controllers/postControllers.js';
import postAgentController from '../../controllers/postAgentController.js';
const router = express.Router()

router.post('/create',protectRoute,createPostController)
router.get('/fetchAll/:spaceId',protectRoute,fetchAllPostsController)
router.post('/comment/:postId',protectRoute,addCommentController)
router.get('/fetch/:spaceId/post/:postId',protectRoute,fetchPostController)
router.post('/addLike/:postId',protectRoute,addLikesController)

// Ai Agent Route
router.post('/agent',postAgentController.postAgent)
export default router;