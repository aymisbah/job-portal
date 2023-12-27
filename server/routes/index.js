import express from 'express';

import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import CompanyRoute from '../routes/companiesRoutes.js';
import jobRoute from './jobRoutes.js'
const router = express.Router();

const path = "/api-v1/";


router.use(`${path}auth`, authRoute);
router.use(`${path}users`, userRoute);
router.use(`${path}companies`, CompanyRoute);
router.use(`${path}jobs`, jobRoute);

export default router;