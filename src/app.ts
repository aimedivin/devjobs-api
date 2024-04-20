import express, { Request } from "express";
import cors from "cors";
import multer, { FileFilterCallback } from 'multer';
import { PrismaClient } from '@prisma/client'

import 'dotenv'

import jobRoutes from './routes/jobRoutes';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import path from "path";


const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images/');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter
});

app.use('/images', express.static(path.join(__dirname, '..', 'images')));


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ status: 'API is running' });
})

app.use('/api/jobs', jobRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/auth', upload.single('logo'), authRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on the port: ${PORT}`);

})