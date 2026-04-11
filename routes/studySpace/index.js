import express from 'express';

import studySpaceRoutes from './studySpaceRoutes.js';
import postRoutes from './postRoutes.js';
import meetRoute from './meetRoutes.js';
import resourceRoutes from './resourceRoutes.js';
// import noteRoutes from './noteRoutes.js';
// import materialRoutes from './materialRoutes.js';

const router = express.Router();

router.use('/', studySpaceRoutes);
router.use('/posts', postRoutes);
router.use('/meet', meetRoute);
router.use('/resources', resourceRoutes);

// router.use('/notes', noteRoutes);
// router.use('/materials', materialRoutes);

export default router;
