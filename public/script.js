let allBooks = [];
let filteredBooks = [];

document.addEventListener('DOMContentLoaded', function() {
    loadBooks();

    // Modal elements
    const addBookModal = document.getElementById('addBookModal');
    const editBookModal = document.getElementById('editBookModal');
    const borrowBookModal = document.getElementById('borrowBookModal');
    const addBookBtn = document.getElementById('addBookBtn');
    const closeBtns = document.getElementsByClassName('close');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const genreFilter = document.getElementById('genreFilter');
    const statusFilter = document.getElementById('statusFilter');
    const clearFilters = document.getElementById('clearFilters');

    // Open add book modal
    addBookBtn.onclick = function() {
        addBookModal.style.display = 'block';
    }

    // Close modals
    for (let closeBtn of closeBtns) {
        closeBtn.onclick = function() {
            addBookModal.style.display = 'none';
            editBookModal.style.display = 'none';
            borrowBookModal.style.display = 'none';
        }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == addBookModal) {
            addBookModal.style.display = 'none';
        }
        if (event.target == editBookModal) {
            editBookModal.style.display = 'none';
        }
        if (event.target == borrowBookModal) {
            borrowBookModal.style.display = 'none';
        }
    }

    // Search functionality
    searchBtn.onclick = applyFilters;
    searchInput.onkeyup = function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    };

    // Filter functionality
    genreFilter.onchange = applyFilters;
    statusFilter.onchange = applyFilters;
    clearFilters.onclick = clearAllFilters;

    // Add book form
    document.getElementById('addBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const book = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            isbn: document.getElementById('isbn').value,
            publishedYear: parseInt(document.getElementById('publishedYear').value),
            genre: document.getElementById('genre').value
        };
        addBook(book);
        addBookModal.style.display = 'none';
        this.reset();
    });

    // Edit book form
    document.getElementById('editBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const book = {
            title: document.getElementById('editTitle').value,
            author: document.getElementById('editAuthor').value,
            isbn: document.getElementById('editIsbn').value,
            publishedYear: parseInt(document.getElementById('editPublishedYear').value),
            genre: document.getElementById('editGenre').value,
            available: document.getElementById('editAvailable').checked
        };
        updateBook(currentEditId, book);
        editBookModal.style.display = 'none';
    });

    // Borrow book form
    document.getElementById('borrowBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const borrowData = {
            borrowerName: document.getElementById('borrowerName').value,
            borrowerEmail: document.getElementById('borrowerEmail').value,
            dueDate: document.getElementById('dueDate').value
        };
        borrowBook(currentBorrowId, borrowData);
        borrowBookModal.style.display = 'none';
        this.reset();
    });
});

let currentEditId = null;
let currentBorrowId = null;

// Notification functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        allBooks = await response.json();
        populateGenreFilter();
        applyFilters();
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function populateGenreFilter() {
    const genreFilter = document.getElementById('genreFilter');
    const genres = [...new Set(allBooks.map(book => book.genre))].sort();

    // Clear existing options except "All Genres"
    genreFilter.innerHTML = '<option value="">All Genres</option>';

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedGenre = document.getElementById('genreFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;

    filteredBooks = allBooks.filter(book => {
        const matchesSearch = !searchTerm ||
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm);

        const matchesGenre = !selectedGenre || book.genre === selectedGenre;

        const matchesStatus = !selectedStatus ||
            (selectedStatus === 'available' && book.available && !book.isBorrowed) ||
            (selectedStatus === 'borrowed' && book.isBorrowed) ||
            (selectedStatus === 'unavailable' && !book.available && !book.isBorrowed);

        return matchesSearch && matchesGenre && matchesStatus;
    });

    displayBooks(filteredBooks);
}

function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('statusFilter').value = '';
    applyFilters();
}

function displayBooks(books) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';

    if (books.length === 0) {
        booksList.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No books match your search criteria.</p>';
        return;
    }

    books.forEach(book => {
        const isBorrowed = book.isBorrowed;
        const statusText = isBorrowed ? 'Borrowed' : (book.available ? 'Available' : 'Unavailable');
        const statusClass = isBorrowed ? 'status-borrowed' : (book.available ? 'status-available' : 'status-unavailable');

        let borrowingInfo = '';
        let actionButtons = '';

        if (isBorrowed) {
            // Show borrowing information
            const borrowDate = new Date(book.borrowDate).toLocaleDateString();
            const dueDate = new Date(book.dueDate).toLocaleDateString();
            borrowingInfo = `
                <p><strong>Borrowed by:</strong> ${book.borrowerName} (${book.borrowerEmail})</p>
                <p><strong>Borrow Date:</strong> ${borrowDate}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
            `;
            actionButtons = `
                <button class="return-btn" onclick="returnBook('${book._id}')">Return Book</button>
                <button class="edit-btn" onclick="openEditModal('${book._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteBook('${book._id}')">Delete</button>
            `;
        } else {
            // Available book - show borrow button
            actionButtons = `
                <button class="borrow-btn" onclick="openBorrowModal('${book._id}')">Borrow Book</button>
                <button class="edit-btn" onclick="openEditModal('${book._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteBook('${book._id}')">Delete</button>
            `;
        }

        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <span class="status-badge ${statusClass}">
                ${statusText}
            </span>
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Published Year:</strong> ${book.publishedYear}</p>
            <p><strong>Genre:</strong> ${book.genre}</p>
            ${borrowingInfo}
            <div class="book-actions">
                ${actionButtons}
            </div>
        `;
        booksList.appendChild(bookCard);
    });
}

async function addBook(book) {
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book),
        });

        if (response.ok) {
            const newBook = await response.json();
            showNotification(`Book "${newBook.title}" added successfully!`);
            loadBooks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add book', 'error');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function openEditModal(bookId) {
    fetch(`/api/books/${bookId}`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('editTitle').value = book.title;
            document.getElementById('editAuthor').value = book.author;
            document.getElementById('editIsbn').value = book.isbn;
            document.getElementById('editPublishedYear').value = book.publishedYear;
            document.getElementById('editGenre').value = book.genre;
            document.getElementById('editAvailable').checked = book.available;
            currentEditId = bookId;
            editBookModal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching book:', error));
}

async function updateBook(bookId, book) {
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book),
        });

        if (response.ok) {
            const updatedBook = await response.json();
            showNotification(`Book "${updatedBook.title}" updated successfully!`);
            loadBooks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update book', 'error');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function deleteBook(bookId) {
    // Find the book name for notification
    const bookToDelete = allBooks.find(book => book._id === bookId);
    const bookTitle = bookToDelete ? bookToDelete.title : 'Book';

    if (confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showNotification(`Book "${bookTitle}" deleted successfully!`);
                loadBooks();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete book', 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
}

function openBorrowModal(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    if (book && !book.isBorrowed) {
        currentBorrowId = bookId;
        borrowBookModal.style.display = 'block';
    }
}

async function borrowBook(bookId, borrowData) {
    try {
        const response = await fetch(`/api/books/${bookId}/borrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(borrowData),
        });

        if (response.ok) {
            const updatedBook = await response.json();
            showNotification(`Book "${updatedBook.title}" borrowed successfully!`);
            loadBooks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to borrow book', 'error');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function returnBook(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    const bookTitle = book ? book.title : 'Book';

    if (confirm(`Are you sure you want to return "${bookTitle}"?`)) {
        try {
            const response = await fetch(`/api/books/${bookId}/return`, {
                method: 'POST',
            });

            if (response.ok) {
                const returnedBook = await response.json();
                showNotification(`Book "${returnedBook.title}" returned successfully!`);
                loadBooks();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to return book', 'error');
            }
        } catch (error) {
            console.error('Error returning book:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
}
