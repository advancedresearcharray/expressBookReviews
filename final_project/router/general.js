const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const filteredBooks = Object.entries(books)
    .filter(([_, details]) => details.author.toLowerCase() === author)
    .reduce((acc, [isbn, details]) => {
      acc[isbn] = details;
      return acc;
    }, {});
  return res.status(200).json(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.entries(books)
    .filter(([_, details]) => details.title.toLowerCase() === title)
    .reduce((acc, [isbn, details]) => {
      acc[isbn] = details;
      return acc;
    }, {});
  return res.status(200).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

// Promise callback with Axios - get all books
public_users.get('/async/books',function (req, res) {
  axios
    .get("http://127.0.0.1:5000/")
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(500).json({ message: "Error fetching books", error: error.message }));
});

// async/await with Axios - get by ISBN
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// async/await with Axios - get by author
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// async/await with Axios - get by title
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

module.exports.general = public_users;
