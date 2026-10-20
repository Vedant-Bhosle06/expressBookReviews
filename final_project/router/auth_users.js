const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Returns true if a user with this username is already registered
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

// Returns true if username AND password match a registered user
const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
};

// Task 7: Login (full path: POST /customer/login)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }

    // Create the JWT (secret "access" is the same one index.js uses to verify)
    const accessToken = jwt.sign({ username: username }, "access", { expiresIn: 60 * 60 });

    // Save the token and username in the session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Customer successfully logged in" });
});

// Task 8: Add or modify a book review (PUT /customer/auth/review/:isbn?review=...)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
    }
    if (!review) {
        return res.status(400).json({ message: "Please provide a review as a query parameter, e.g. ?review=Great%20book" });
    }

    const alreadyReviewed = books[isbn].reviews[username] !== undefined;

    // Same user -> overwrites their review. Different user -> adds a new entry.
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: alreadyReviewed
            ? `Review for ISBN ${isbn} modified successfully.`
            : `Review for ISBN ${isbn} added successfully.`,
        reviews: books[isbn].reviews
    });
});

// Task 9: Delete the logged-in user's own review (DELETE /customer/auth/review/:isbn)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
    }
    if (books[isbn].reviews[username] === undefined) {
        return res.status(404).json({ message: `You have no review to delete for ISBN ${isbn}.` });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review for ISBN ${isbn} by ${username} deleted successfully.`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;