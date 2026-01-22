const express = require('express');
const router = express.Router();
const db = require('../db/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_secret_key"; // Use same key as login

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Get performance data for the logged-in user
router.get('/', authenticate, (req, res) => {
  const query = `
    SELECT u.Name AS Full_Name, p.Task_completed
    FROM performance p
    JOIN user u ON p.User_ID = u.User_ID
    WHERE p.User_ID = ?
  `;

  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching performance data:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

module.exports = router;
