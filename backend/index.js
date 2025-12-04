import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import { authMiddleware } from "./middleware/authMiddleware.js";