# 📚 Library Management System

A full-stack web application for managing a library's book inventory and borrow/return operations. Built with **Node.js**, **Express**, and **MongoDB** (via Mongoose), with a responsive front end written in plain HTML, CSS, and vanilla JavaScript.

---

## ✨ Features

**Book Management**
- Add, view, update, and delete books
- Track title, author, ISBN, published year, and genre
- Server-side validation (required fields, valid publication year, unique ISBN)

**Borrow / Return Workflow**
- Borrow a book by recording borrower name, email, and due date
- Return a book, which clears the borrower information and restores availability
- Guards against borrowing an already-borrowed book or returning a non-borrowed one
- Visual status badges: **Available**, **Borrowed**, **Unavailable**

**Search & Filtering**
- Search books by title, author, or genre (case-insensitive, supports Enter key)
- Filter by genre (dynamically populated from the collection)
- Filter by availability status
- Clear-all-filters button

**User Interface**
- Modal dialogs for Add, Edit, and Borrow actions (close via ✕ or clicking outside)
- Toast-style notifications for success and error feedback
- Confirmation prompts before deleting or returning a book
- Separate admin login page (demo gate)

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Runtime   | Node.js |
| Backend   | Express 5 |
| Database  | MongoDB with Mongoose ODM |
| Frontend  | HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| Middleware | `cors`, `body-parser` |

---

## 📁 Project Structure

```
Library-Management-System/
├── public/
│   ├── index.html      # Main dashboard (book list, modals, filters)
│   ├── login.html      # Admin login page
│   ├── script.js       # Frontend logic (API calls, filtering, rendering)
│   └── styles.css      # Styling
├── server.js           # Express app, Mongoose schema, REST API routes
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later recommended)
- **MongoDB** running locally on the default port (`mongodb://localhost:27017`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RaviRaushanK/Library-Management-System.git
   cd Library-Management-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running locally, then start the server:
   ```bash
   npm start
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

   The server serves the static files from the `public/` directory, so `index.html` loads automatically.

> **Note:** The MongoDB connection string is hardcoded in `server.js` as `mongodb://localhost:27017/library`. Adjust it there if your database lives elsewhere.

---

## 🔐 Admin Login

Visit `http://localhost:3000/login.html` for the admin login screen.

| Username | Password   |
|----------|------------|
| `admin`  | `admin123` |

> ⚠️ **This is a demo-only client-side check.** It is not real authentication and should never be used in production.

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/books`                  | Get all books                        |
| GET    | `/books/:id`              | Get a single book by ID              |
| POST   | `/books`                  | Create a new book                    |
| PUT    | `/books/:id`              | Update a book                        |
| DELETE | `/books/:id`              | Delete a book                        |
| POST   | `/books/:id/borrow`       | Borrow a book                        |
| POST   | `/books/:id/return`       | Return a book                        |

### Request / Response Examples

**Create a book** — `POST /api/books`
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "publishedYear": 1925,
  "genre": "Fiction"
}
```

**Borrow a book** — `POST /api/books/:id/borrow`
```json
{
  "borrowerName": "Jane Doe",
  "borrowerEmail": "jane@example.com",
  "dueDate": "2026-10-30"
}
```

**Return a book** — `POST /api/books/:id/return`
```json
{}
```

### Book Object
```json
{
  "_id": "65f1a2...",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "publishedYear": 1925,
  "genre": "Fiction",
  "available": true,
  "isBorrowed": false,
  "borrowerName": null,
  "borrowerEmail": null,
  "borrowDate": null,
  "dueDate": null
}
```

---

## 📦 Scripts

| Command     | Description              |
|-------------|--------------------------|
| `npm start` | Start the Express server |

---

## 🔮 Possible Enhancements

- Real authentication and role-based access (admin vs. patron)
- Pagination and sorting for large collections
- Overdue-book detection and notifications
- Input sanitization and rate limiting
- Environment-based configuration (`.env`) for the DB URI and port
- Automated tests

---

## 📄 License

This project is licensed under the ISC License.

