import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoute from './routes/userRoute';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const key = process.env.MONGO_URI as string

mongoose
    .connect(key as string)
    .then(() => console.log("Connected to database!"));


app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.get("/health", (_req, res) => res.send({ message: "Health OK!" }));


app.use("/api/v1/user", userRoute);

app.listen(port, () => {
    ``
    console.log(`Server is running on port ${port}`);
});
