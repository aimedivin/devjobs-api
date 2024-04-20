import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from "@prisma/client";
import { isKeyObject } from "util/types";

const jobClient = new PrismaClient().job;

interface JobType {
    id?: string;
    position?: string;
    postedAt?: string;
    contract?: string;
    location?: string;
    apply?: string;
    description?: string;
    companyId?: string;
}

export class Job {
    //GET ALL JOBS
    getJobs: RequestHandler = async (req, res) => {
        try {
            const jobs = await jobClient.findMany(
                {
                    include: {
                        company: {
                            select: {
                                name: true,
                                logo: true,
                                logoBackground: true,
                                website: true
                            }
                        },
                        AppliedJobs: true
                    }
                }
            );

            res.status(200).json({ jobs: jobs })
        } catch (error) {
            res.status(500)
                .json({
                    status: 'Server Error.',
                    error: error
                })
        }
    }

    //GET SINGLE JOB BY ID
    getJob: RequestHandler = async (req, res) => {
        try {
            const jobId = req.params.id;
            const job = await jobClient.findUnique({
                where: {
                    id: jobId
                },
                include: {
                    company: {
                        select: {
                            name: true,
                            logo: true,
                            logoBackground: true,
                            website: true
                        }
                    },
                    AppliedJobs: true
                }
            })

            if (!job) {
                return res.status(404).json({ message: "Job not found." });
            }

            res.status(200).json({ job })
        } catch (error) {
            res.status(500)
                .json({
                    status: 'Server Error.',
                    error: error
                })
        }
    }


    //CREATING JOB
    postJob: RequestHandler = async (req, res) => {
        
        try {
            const jobData = req.body;
            
            jobData['companyId'] = req.companyId;
            
            if (jobData.id) {
                delete jobData.id;
            }

            const job = await jobClient.create({
                data: jobData
            })

            res.status(201).json({ job })
        } catch (error) {
            
            res.status(500)
                .json({
                    status: 'Server Error.',
                    error: error
                })
        }
    }

    //UPDATING A JOB
    putJob: RequestHandler = async (req, res) => {
        try {
            const jobId = req.params.id
            const jobData: JobType = req.body;

            if (jobData.id) {
                delete jobData.id;
            }

            const job = await jobClient.update({
                where: {
                    id: jobId
                },
                data: jobData
            })
            if (!job) {
                res.status(404)
                    .json({
                        message: 'Job not Found'
                    })
            }
            res.status(200).json({ job })
        } catch (error) {
            if ((error as Error).name === 'PrismaClientKnownRequestError') {
                res.status(404)
                    .json({
                        message: 'Job not Found'
                    })
            }
            else if ((error as Error).name === 'PrismaClientValidationError') {
                res.status(422)
                    .json({
                        message: 'Validation Error'
                    })
            } else {
                res.status(500)
                    .json({
                        status: 'Server Error.',
                        error: error
                    })
            }
        }
    }

    //DELETING A JOB
    deleteJob: RequestHandler = async (req, res) => {
        try {
            const jobId = req.params.id

            const job = await jobClient.delete({
                where: {
                    id: jobId
                }
            })

            res.status(200).json({ status: 'Job was successfully deleted' })
        } catch (error) {
            if ((error as Error).name === 'PrismaClientKnownRequestError') {
                res.status(404)
                    .json({
                        status: 'Job not Found'
                    })
            } else {
                res.status(500)
                    .json({
                        status: 'Server Error.',
                        error: error
                    })
            }

        }
    }
}