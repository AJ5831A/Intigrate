import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.route.js';
import projectRoutes from './routes/project.route.js';
import memberRoutes from './routes/member.route.js';
import { pool } from "./db/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ msg: "Server working", time: result.rows[0] });
});
pool.query("SELECT 1", (err, res) => {
    if (err) {
      console.error("Database not connected:", err);
    } else {
      console.log("Database connected successfully");
    }
  });

app.use('/auth' , authRoutes) 
app.use('/project' , projectRoutes) 
app.use('/project' , memberRoutes)

app.listen(8080, () => console.log("Backend running on localhost:8080"));