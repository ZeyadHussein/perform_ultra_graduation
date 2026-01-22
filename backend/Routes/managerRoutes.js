const express = require("express");
const pool = require("../db/db"); // Reuse your database connection pool
const router = express.Router();

// Get all managers with user and department details
router.get('/managers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.Manager_ID, u.User_ID, u.first_name, u.last_name, u.email,
             d.Department_name
      FROM manager m
      JOIN user u ON m.User_ID = u.User_ID
      LEFT JOIN department d ON u.Department_ID = d.Department_ID
      ORDER BY d.Department_name, u.last_name
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching managers:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all managers with user info (callback version)
router.get('/managers-with-users', (req, res) => {
  pool.query(`
    SELECT m.Manager_ID,
           u.User_ID, u.Name, u.Email, u.Role,
           d.Department_name
    FROM manager m
    JOIN user u ON m.User_ID = u.User_ID
    LEFT JOIN department d ON u.Department_ID = d.Department_ID
    ORDER BY d.Department_name, u.Name
  `, (err, results) => {
    if (err) {
      console.error("❌ Error fetching managers:", err.message);
      return res.status(500).json({ message: "Error fetching managers" });
    }
    res.json(results);
  });
});

module.exports = router;
