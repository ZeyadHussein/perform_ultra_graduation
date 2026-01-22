const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Must match the secret used in userroutes.js

// ✅ Middleware to verify JWT
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // decoded = { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ Get attendance for a specific user
router.get("/attendance/:User_ID", authenticate, (req, res) => {
  const { User_ID } = req.params;
  const userIdFromToken = req.user.id;

  if (userIdFromToken !== parseInt(User_ID)) {
    return res.status(403).json({ message: "Forbidden: You can only view your own attendance" });
  }

  const query = `
    SELECT 
      a.*, 
      u.Name, 
      u.Role 
    FROM attendance a
    JOIN user u ON a.User_ID = u.User_ID
    WHERE a.User_ID = ?
    ORDER BY a.start_date
  `;

  pool.query(query, [User_ID], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});



module.exports = router;
