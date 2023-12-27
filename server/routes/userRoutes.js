import express from 'express';
import userAuth from '../middlewares/authMIddleware.js';
import { getUser, updateUser} from '../Controllers/userController.js'
const router = express.Router()

//getUser
router.post('/get-user',userAuth , getUser)
//Update
router.put("/update-user", userAuth, updateUser)

export default router;