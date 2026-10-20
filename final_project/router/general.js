const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

/* =====================================================
   TASKS 1-6 : synchronous implementations
   ===================================================== */

// Task 6: Register a new user (POST /register)
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists. Please choose another one." });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Task 1: Get the list of all books (GET /)
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN (GET /isbn/:isbn)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
});

// Task 3: Get book details based on author (GET /author/:author)
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const keys = Object.keys(books);   // "1", "2", ... "10"
    const matches = [];

    for (const key of keys) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matches.push({ isbn: key, ...books[key] });
        }
    }

    if (matches.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: matches }, null, 4));
    }
    return res.status(404).json({ message: `No books found for author ${author}.` });
});

// Task 4: Get book details based on title (GET /title/:title)
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const keys = Object.keys(books);
    const matches = [];

    for (const key of keys) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matches.push({ isbn: key, ...books[key] });
        }
    }

    if (matches.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: matches }, null, 4));
    }
    return res.status(404).json({ message: `No books found with title ${title}.` });
});

// Task 5: Get book reviews (GET /review/:isbn)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
    }

    const reviews = books[isbn].reviews;
    if (Object.keys(reviews).length === 0) {
        return res.status(200).json({ message: "No reviews found for this book." });
    }
    return res.status(200).send(JSON.stringify(reviews, null, 4));
});

/* =====================================================
   TASKS 10-13 : same functionality using async/await + Axios
   Each route calls the synchronous route above through Axios.
   (Separate /async/... paths so they don't call themselves.)
   ===================================================== */

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        return res.status(status).json({ message: "Error fetching the list of books." });
    }
});

// Task 11: Get book details by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        return res.status(status).json({ message: "Error fetching the book by ISBN." });
    }
});

// Task 12: Get book details by author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        return res.status(status).json({ message: "Error fetching books by author." });
    }
});

// Task 13: Get book details by title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        return res.status(status).json({ message: "Error fetching books by title." });
    }
});

module.exports.general = public_users;