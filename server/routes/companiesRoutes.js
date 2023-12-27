import express from 'express';
import { rateLimit} from 'express-rate-limit';
import userAuth from '../middlewares/authMIddleware.js';
import {register,signIn , getCompanies, getCompanyByID, getCompanyJobListing, getCompanyProfile, updateCompanyProfile } from '../Controllers/companiesController.js';


const router = express.Router();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

router.post('/register', limiter, register)
router.post('/login', limiter, signIn)

router.post('/get-company-profile' , userAuth , getCompanyProfile);
router.post('/get-company-joblisting', userAuth , getCompanyJobListing);
router.get('/', getCompanies);
router.get("/get-company/:id", getCompanyByID)

router.put('/update-company', userAuth ,updateCompanyProfile);

export default router;