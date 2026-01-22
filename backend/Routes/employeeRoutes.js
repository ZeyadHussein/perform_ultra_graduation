const express = require("express");
const pool = require("../db/db"); // ✅ Renamed from 'db' to 'pool' to match usage below
const router = express.Router();

// Employee routes
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.Employee_ID, u.User_ID, u.first_name, u.last_name, u.email, 
             d.Department_name, e.hourly_rate
      FROM employee e
      JOIN user u ON e.User_ID = u.User_ID
      LEFT JOIN department d ON u.Department_ID = d.Department_ID
      ORDER BY d.Department_name, u.last_name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all employees with user details
router.get('/employees-with-users', (req, res) => {
  pool.query(`
    SELECT e.Employee_ID, e.hourly_rate, 
           u.User_ID, u.Name, u.Email, u.Role,
           d.Department_name 
    FROM employee e
    JOIN user u ON e.User_ID = u.User_ID
    LEFT JOIN department d ON u.Department_ID = d.Department_ID
    ORDER BY d.Department_name, u.Name
  `, (err, results) => {
    if (err) {
      console.error("❌ Error fetching employees:", err.message);
      return res.status(500).json({ message: "Error fetching employees" });
    }
    res.json(results);
  });
});

module.exports = router;
