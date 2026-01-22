const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// 🔹 Route to get all departments
router.get("/departments", (req, res) => {
    pool.query("SELECT * FROM department", (err, results) => {
        if (err) {
            console.error("❌ Error fetching departments:", err);
            return res.status(500).json({ message: "Error fetching departments" });
        }
        res.json(results);
    });
});

// 🔹 Route to get a single department by ID
router.get("/departments/:id", (req, res) => {
    const { id } = req.params;

    pool.query("SELECT * FROM department WHERE Department_ID = ?", [id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching department:", err);
            return res.status(500).json({ message: "Error fetching department" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json(results[0]);
    });
});

// 🔹 Route to add a new department
router.post("/add-department", (req, res) => {
    const { Department_ID, Department_name } = req.body;

    if (!Department_ID || !Department_name) {
        return res.status(400).json({ message: "All fields are required" });
    }

    pool.query(
        "INSERT INTO department (Department_ID, Department_name) VALUES (?, ?)",
        [Department_ID, Department_name],
        (err, result) => {
            if (err) {
                console.error("❌ Error adding department:", err);
                return res.status(500).json({ message: "Error adding department" });
            }
            res.status(201).json({ message: "✅ Department added successfully", departmentId: result.insertId });
        }
    );
});

// 🔹 Route to update a department
router.put("/update-department/:id", (req, res) => {
    const { id } = req.params;
    const { Department_name } = req.body;

    if (!Department_name) {
        return res.status(400).json({ message: "Department name is required" });
    }

    pool.query(
        "UPDATE department SET Department_name = ? WHERE Department_ID = ?",
        [Department_name, id],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating department:", err);
                return res.status(500).json({ message: "Error updating department" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Department not found" });
            }
            res.json({ message: "✅ Department updated successfully" });
        }
    );
});

// 🔹 Route to delete a department
router.delete("/delete-department/:id", (req, res) => {
    const { id } = req.params;

    pool.query("DELETE FROM department WHERE Department_ID = ?", [id], (err, result) => {
        if (err) {
            console.error("❌ Error deleting department:", err);
            return res.status(500).json({ message: "Error deleting department" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Department not found" });
        }
        res.json({ message: "✅ Department deleted successfully" });
    });
});

module.exports = router;
