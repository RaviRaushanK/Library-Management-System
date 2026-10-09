const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/library')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Book Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  publishedYear: Number,
  genre: String,
  available: { type: Boolean, default: true },
  isBorrowed: { type: Boolean, default: false },
  borrowerName: String,
  borrowerEmail: String,
  borrowDate: Date,
  dueDate: Date
});

const Book = mongoose.model('Book', bookSchema);

// Routes
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genre } = req.body;

    // Basic validation
    if (!title || !author || !isbn || !publishedYear || !genre) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (publishedYear < 1000 || publishedYear > new Date().getFullYear() + 1) {
      return res.status(400).json({ error: 'Invalid published year' });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ error: 'Book with this ISBN already exists' });
    }

    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrow book
app.post('/api/books/:id/borrow', async (req, res) => {
  try {
    const { borrowerName, borrowerEmail, dueDate } = req.body;

    if (!borrowerName || !borrowerEmail || !dueDate) {
      return res.status(400).json({ error: 'Borrower name, email, and due date are required' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.isBorrowed) {
      return res.status(400).json({ error: 'Book is already borrowed' });
    }

    book.isBorrowed = true;
    book.available = false;
    book.borrowerName = borrowerName;
    book.borrowerEmail = borrowerEmail;
    book.borrowDate = new Date();
    book.dueDate = new Date(dueDate);

    await book.save();
    res.json(book);
  } catch (err) {
    console.error('Error borrowing book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Return book
app.post('/api/books/:id/return', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!book.isBorrowed) {
      return res.status(400).json({ error: 'Book is not currently borrowed' });
    }

    book.isBorrowed = false;
    book.available = true;
    book.borrowerName = undefined;
    book.borrowerEmail = undefined;
    book.borrowDate = undefined;
    book.dueDate = undefined;

    await book.save();
    res.json(book);
  } catch (err) {
    console.error('Error returning book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
