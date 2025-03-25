import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  recommendedBooks,
} from "../controllers/book.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createBook);
router.get("/all", protectRoute, getAllBooks);
router.get("/user", protectRoute, recommendedBooks);
router.delete("/del/:id", protectRoute, deleteBook);

export default router;
