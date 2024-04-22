import { Router } from "express";

import { User, Company } from "../controllers/auth";

const router = Router();

const userControllers = new User();
const companyControllers = new Company();

// CREATING NEW USER
router.post('/user', userControllers.postUser);

// LOGIN USER
router.post('/user/login', userControllers.postLoginUser);

// CREATING NEW COMPANY
router.post('/company', companyControllers.postCompany);

// LOGIN COMPANY
router.post('/company/login', companyControllers.postLoginCompany);

// REFRESH TOKEN
router.get('/token', companyControllers.accessToken);

export default router;