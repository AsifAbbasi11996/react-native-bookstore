import cloudinary from "../lib/cloudinary.js";
import Book from "../models/books.model.js";

export const createBook = async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;

    if (!title || !caption || !image || !rating) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to database
    const newBook = await Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });

    await newBook.save();
    res.status(200).json(newBook);
  } catch (error) {
    console.error("Error creating Book", error);
    return res.status(500).json({ message: "Failed to create book" });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();
    return res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {}
};

// get recommended books by the logged in user
export const recommendedBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error getting recommended books", error);
    return res.status(500).json({ message: "Failed to get recommended books" });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // check if the user is the creator of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unathourized" });
    }

    // delete the image from cloudinary as well
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from cloudinary", error);
      }
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting Book", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
