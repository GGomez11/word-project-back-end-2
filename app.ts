import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import wordsRouter from "./routes/words";
import userRouter from "./routes/user"
import mongoose from "mongoose";

// Initialize environment variables
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI as string)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Could not connect to MongoDB:', error));

// Create an Express app
const app = express();

// Middleware configurations
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONT_END_HOST,
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Routes
app.use("/api/words", wordsRouter);
app.use("/api/users", userRouter);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});