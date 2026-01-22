const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key"; // Replace with a secure key in production

// ✅ Authentication Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    console.log("Auth Header:", authHeader); // Debug

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
        res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ Register New User
router.post("/adduser", async (req, res) => {
    const { Name, Email, Password, Role, City, District, Department_ID } = req.body;

    if (!Name || !Email || !Password || !Role) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(Password, 10);

        pool.query(
            "INSERT INTO user (Name, Email, Password, Role, City, District, Department_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [Name, Email, hashedPassword, Role, City, District, Department_ID],
            (err, result) => {
                if (err) {
                    console.error("Error adding user:", err);
                    return res.status(500).json({ message: "Error adding user", error: err.message });
                }

                const userId = result.insertId;

                let targetTable = null;
                if (Role.toLowerCase() === "employee") targetTable = "employee";
                else if (Role.toLowerCase() === "manager") targetTable = "manager";

                if (targetTable) {
                    pool.query(
                        `INSERT INTO ${targetTable} (User_ID) VALUES (?)`,
                        [userId],
                        (err2) => {
                            if (err2) {
                                console.error(`Error inserting into ${targetTable}:`, err2);
                                return res.status(500).json({ message: `User added but failed to insert into ${targetTable}`, userId });
                            }
                            res.status(201).json({ message: `User added successfully as ${Role}`, userId });
                        }
                    );
                } else {
                    res.status(201).json({ message: "User added successfully", userId });
                }
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ Login and Generate Token
router.post("/login", (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and Password are required" });
    }

    pool.query("SELECT * FROM user WHERE Email = ?", [Email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Internal server error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const passwordMatch = await bcrypt.compare(Password, user.Password);
        if (!passwordMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.User_ID, role: user.Role }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    });
});

// ✅ Get Profile
router.get("/user/profile", authenticate, (req, res) => {
    pool.query(
        "SELECT Name, Email, City, District, Department_ID FROM user WHERE User_ID = ?",
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error fetching profile", error: err.message });
            if (results.length === 0) return res.status(404).json({ message: "User not found" });
            res.json(results[0]);
        }
    );
});

// ✅ Update Profile
router.put("/user/profile", authenticate, (req, res) => {
    const { Name, Email, City, District, Department_ID } = req.body;

    if (!Name || !Email) {
        return res.status(400).json({ message: "Name and Email are required" });
    }

    const updateQuery = `
        UPDATE user 
        SET Name = ?, Email = ?, City = ?, District = ?, Department_ID = ?
        WHERE User_ID = ?
    `;

    pool.query(updateQuery, [Name, Email, City, District, Department_ID, req.user.id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Profile updated successfully" });
    });
});

// ✅ Route to delete a user
router.delete("/delete-user", (req, res) => {
    const { User_ID } = req.body;

    if (!User_ID) {
        return res.status(400).json({ message: "User ID is required" });
    }

    pool.query("DELETE FROM user WHERE User_ID = ?", [User_ID], (err, result) => {
        if (err) {
            console.error("❌ Error deleting user:", err);
            return res.status(500).json({ message: "Error deleting user" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "✅ User deleted successfully" });
    });
});
// ✅ Get All Users (for assigning tasks)
router.get("/users", authenticate, (req, res) => {
    pool.query("SELECT User_ID, Name, Role FROM user", (err, results) => {
        if (err) {
            console.error("❌ Error fetching users:", err);
            return res.status(500).json({ message: "Error fetching users" });
        }
        res.json(results);
    });
});


module.exports = router;