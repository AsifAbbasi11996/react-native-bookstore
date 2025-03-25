import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/database/db.js";

dotenv.config();

import authRoutes from "./src/routes/user.routes.js";
import bookRoutes from "./src/routes/book.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
