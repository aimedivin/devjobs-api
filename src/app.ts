import express, { Request } from "express";
import cors from "cors";
import { PrismaClient } from '@prisma/client'

import 'dotenv'

import jobRoutes from './routes/jobRoutes';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';


const app = express();

const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
})

app.use('/api/jobs', jobRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000;

const connectToDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Failed to connect to the database', error);
    }
}

app.listen(PORT, async() => {
    await connectToDatabase();
    console.log(`Server started on the port: ${PORT}`);
})