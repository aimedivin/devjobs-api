import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from "@prisma/client";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

const userClient = new PrismaClient().user;
const companyClient = new PrismaClient().company;

export class User {
    postUser: RequestHandler = async (req, res) => {
        try {
            const userData = req.body;

            if (userData.id) {
                delete userData.id;
            }

            userData.password = await bcrypt.hash(userData.password, 12);

            const user = await userClient.create({
                data: userData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    occupation: true,
                    AppliedJobs: true
                }
            });

            res.status(200).json({ user: user });
        } catch (error) {
            if ((error as Error).name === 'PrismaClientKnownRequestError') {
                res.status(409)
                    .json({
                        message: 'User already exist'
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
    postLoginUser: RequestHandler = async (req, res) => {
        try {
            const { email, password } = req.body;
            

            const user = await userClient.findUnique({
                where: {
                    email: email
                }
            });

            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    return res
                        .status(200)
                        .json({
                            token: jwt.sign(
                                {
                                    userId: user.id,
                                    email: user.email,
                                },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '1h' }
                            ),
                            refreshToken: jwt.sign(
                                {
                                    userId: user.id,
                                    email: user.email,
                                },
                                `${process.env.JWT_REFRESH_SECRET}`
                            )
                        })
                }
            }
            res.status(401).json({ message: 'Authentication Failed' })
        } catch (error) {
            if ((error as Error).name === 'PrismaClientValidationError') {
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
}

export class Company {
    postCompany: RequestHandler = async (req, res) => {
        try {
            const companyData = { ...req.body };

            if (companyData.id) {
                delete companyData.id;
            }

            let logo;
            if (req.file && req.file.path) {
                logo = req.file.path;
            } else {
                return res.status(415).json({ message: 'Unsupported Media Type.' });
            }

            companyData.password = await bcrypt.hash(companyData.password, 12);
            companyData.logo= logo;

            const company = await companyClient.create({
                data: companyData,
                select: {
                    name: true,
                    logo: true,
                    logoBackground: true,
                    website: true,
                    Jobs: true
                }
            });

            res.status(200).json({ company })
        } catch (error) {
            if ((error as Error).name === 'PrismaClientKnownRequestError') {
                res.status(409)
                    .json({
                        message: 'User already exist'
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

    postLoginCompany: RequestHandler = async (req, res) => {
        try {
            const { email, password } = req.body;

            const company = await companyClient.findUnique({
                where: {
                    email: email
                }
            });

            if (company) {
                const match = await bcrypt.compare(password, company.password);
                if (match) {
                    return res
                        .status(200)
                        .json({
                            token: jwt.sign(
                                {
                                    companyId: company.id,
                                    email: company.email,
                                },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '1h' }
                            ),
                            refreshToken: jwt.sign(
                                {
                                    companyId: company.id,
                                    email: company.email,
                                },
                                `${process.env.JWT_REFRESH_SECRET}`
                            )
                        })
                }
            }
            res.status(401).json({ message: 'Authentication Failed' })
        } catch (error) {
            if ((error as Error).name === 'PrismaClientValidationError') {
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
}