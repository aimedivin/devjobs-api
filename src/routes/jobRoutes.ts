import { Router } from "express";

import { Job } from '../controllers/job'

import { isCompanyAuth, isUserAuth } from '../middleware/isAuth'

const router = Router();

const jobControllers = new Job();

// FETCHING ALL JOBS
router.get('/', jobControllers.getJobs);

// FETCHING SINGLE JOB
router.get('/:id', jobControllers.getJob);

// CREATING NEW JOB
router.post('/', isCompanyAuth, jobControllers.postJob);

// UPDATING JOB
router.put('/:id', jobControllers.putJob);

// DELEING JOB
router.delete('/:id', jobControllers.deleteJob);

// APPLYING A JOB
router.post('/apply/:id', isUserAuth, jobControllers.postApplyJob);

export default router;