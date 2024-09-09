import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from "@prisma/client";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

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

            companyData.password = await bcrypt.hash(companyData.password, 12);
            companyData.logo = companyData.name.slice(0,5);

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
            console.log('====================================');
            console.log(error);
            console.log('====================================');
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

    accessToken: RequestHandler = async (req, res) => {
        try {
            const refreshToken = req.body.token;

            const decodedToken = jwt.verify(refreshToken, `${process.env.JWT_REFRESH_SECRET}`) as JwtPayload;

            let account;

            if (decodedToken.companyId) {
                account = await companyClient.findUnique({
                    where: {
                        id: decodedToken.companyId
                    }
                });

                if (account) {
                    return res
                        .status(200)
                        .json({
                            token: jwt.sign(
                                {
                                    companyId: account.id,
                                    email: account.email,
                                },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '10s' }
                            )
                        })
                }
            }
            else if (decodedToken.userId) {
                
                account = await userClient.findUnique({
                    where: {
                        id: decodedToken.userId
                    }
                })
                if (account) {
                    return res
                        .status(200)
                        .json({
                            token: jwt.sign(
                                {
                                    userId: account.id,
                                    email: account.email,
                                },
                                `${process.env.JWT_SECRET}`,
                                { expiresIn: '10s' }
                            )
                        })
                }
            }

            throw new Error("Make sure the submitted token is valid");

        } catch (error) {

            if ((error as Error).name === 'PrismaClientKnownRequestError') {
                return res.status(404).json({ message: 'Make sure the submitted token is valid' });
            }
            else if ((error as Error).name === 'PrismaClientValidationError') {
                res.status(422)
                    .json({
                        message: 'Validation Error'
                    })
            } else if ((error as Error).name === 'JsonWebTokenError') {
                res.status(401)
                    .json({
                        message: 'invalid token'
                    })
            }
            else {
                return res.status(500)
                    .json({
                        status: 'Server Error.',
                        error: error
                    })
            }
        }
    }
}