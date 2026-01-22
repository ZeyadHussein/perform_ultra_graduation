const mysql = require("mysql2");

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password if needed
  database: "perform_ultra",
  port: 3306, // Default MySQL port
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
    return;
  }
  console.log("✅ Connected to MySQL database: perform_ultra");
});

module.exports = db;