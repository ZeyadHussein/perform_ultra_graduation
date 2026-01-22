const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const authenticate = require("../middleware/auth"); // ✅ Ensure correct path

// ✅ Route to submit feedback
router.post("/addfeed", authenticate, (req, res) => {
    const { feedback_text, recipient_id } = req.body;
    const senderID = req.user.id; // This is the logged-in user (sender)

    if (!feedback_text || !recipient_id) {
        return res.status(400).json({ message: "Feedback text and recipient are required" });
    }

    // Save recipient as User_ID in the feedback table
    pool.query(
        "INSERT INTO feedback (User_ID, feedback_text, submission_date) VALUES (?, ?, NOW())",
        [recipient_id, feedback_text],
        (err, result) => {
            if (err) {
                console.error("❌ Error submitting feedback:", err);
                return res.status(500).json({ message: "Database error" });
            }
            res.status(201).json({ message: "✅ Feedback submitted successfully", feedbackID: result.insertId });
        }
    );
});


// ✅ Route to get all feedback (Admin only)
router.get("/feedback", authenticate, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    pool.query("SELECT * FROM feedback", (err, results) => {
        if (err) {
            console.error("❌ Error fetching feedback:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

// ✅ Route to get feedback by user
router.get("/userfeedback", authenticate, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT f.feedback_ID, f.feedback_text, u.Name, u.Role 
        FROM feedback f
        JOIN user u ON f.user_ID = u.User_ID
        WHERE f.user_ID = ?
    `;

    pool.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching feedback:", err);
            return res.status(500).json({ message: "Error fetching feedback" });
        }
        res.json(results);
    });
});

// ✅ Route to delete feedback (Only admin)
router.delete("/delete/:id", authenticate, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const feedbackID = req.params.id;

    pool.query("DELETE FROM feedback WHERE feedback_ID = ?", [feedbackID], (err, result) => {
        if (err) {
            console.error("❌ Error deleting feedback:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.json({ message: "✅ Feedback deleted successfully" });
    });
});

module.exports = router;
