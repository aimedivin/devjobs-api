import { Router } from "express";

import { Account } from '../controllers/account'

import { isCompanyAuth, isUserAuth, isAuth } from '../middleware/isAuth'

const router = Router();

const accountControllers = new Account();

// FETCHING ALL JOBS
router.get('/', isAuth, accountControllers.getAccountInfo);

export default router;