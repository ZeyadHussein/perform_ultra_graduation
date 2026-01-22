const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// 🔹 Route to get all task assignments
router.get("/task-assignments", (req, res) => {
    pool.query("SELECT * FROM task_assignment", (err, results) => {
        if (err) {
            console.error("❌ Error fetching task assignments:", err);
            return res.status(500).json({ message: "Error fetching task assignments" });
        }
        res.json(results);
    });
});

// 🔹 Route to get a single task assignment by ID
router.get("/task-assignments/:id", (req, res) => {
    const { id } = req.params;

    pool.query("SELECT * FROM task_assignment WHERE TA_ID = ?", [id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching task assignment:", err);
            return res.status(500).json({ message: "Error fetching task assignment" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Task assignment not found" });
        }
        res.json(results[0]);
    });
});

// 🔹 Route to add a new task assignment
router.post("/add-task-assignment", (req, res) => {
    const { task_ID, User_ID, completion_status } = req.body;

    if (!task_ID || !User_ID || !completion_status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    pool.query(
        "INSERT INTO task_assignment (task_ID, User_ID, completion_status) VALUES (?, ?, ?)",
        [task_ID, User_ID, completion_status],
        (err, result) => {
            if (err) {
                console.error("❌ Error adding task assignment:", err);
                return res.status(500).json({ message: "Error adding task assignment" });
            }
            res.status(201).json({ 
                message: "✅ Task assignment added successfully", 
                assignmentId: result.insertId 
            });
        }
    );
});

// 🔹 Route to update a task assignment
router.put("/update-task-assignment/:id", (req, res) => {
    const { id } = req.params;
    const { task_ID, User_ID, completion_status } = req.body;

    if (!task_ID || !User_ID || !completion_status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    pool.query(
        "UPDATE task_assignment SET task_ID = ?, User_ID = ?, completion_status = ? WHERE TA_ID = ?",
        [task_ID, User_ID, completion_status, id],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating task assignment:", err);
                return res.status(500).json({ message: "Error updating task assignment" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Task assignment not found" });
            }
            res.json({ message: "✅ Task assignment updated successfully" });
        }
    );
});

// 🔹 Route to delete a task assignment
router.delete("/delete-task-assignment/:id", (req, res) => {
    const { id } = req.params;

    pool.query("DELETE FROM task_assignment WHERE TA_ID = ?", [id], (err, result) => {
        if (err) {
            console.error("❌ Error deleting task assignment:", err);
            return res.status(500).json({ message: "Error deleting task assignment" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task assignment not found" });
        }
        res.json({ message: "✅ Task assignment deleted successfully" });
    });
});

// 🔹 Route to get assignments by user ID
router.get("/user-assignments/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT ta.TA_ID, ta.completion_status, t.task_title, t.description 
    FROM task_assignment ta
    LEFT JOIN task t ON ta.task_ID = t.task_ID
    WHERE ta.User_ID = ?
  `;

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user assignments:", err);
      return res.status(500).json({ message: "Error fetching user assignments" });
    }
    res.json(results);
  });
});

// 🔹 Route to get assignments by task ID
router.get("/task-assignments-by-task/:taskId", (req, res) => {
    const { taskId } = req.params;

    pool.query("SELECT * FROM task_assignment WHERE task_ID = ?", [taskId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching task assignments:", err);
            return res.status(500).json({ message: "Error fetching task assignments" });
        }
        res.json(results);
    });
});

// 🔹 Route to update completion status only
router.patch("/update-task-status/:id", (req, res) => {
    const { id } = req.params;
    const { completion_status } = req.body;

    if (!completion_status) {
        return res.status(400).json({ message: "Completion status is required" });
    }

    pool.query(
        "UPDATE task_assignment SET completion_status = ? WHERE TA_ID = ?",
        [completion_status, id],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating task status:", err);
                return res.status(500).json({ message: "Error updating task status" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Task assignment not found" });
            }
            res.json({ message: "✅ Task status updated successfully" });
        }
    );
});
// 🔹 Route to get summary of task assignment completion status
router.get("/task-assignment-summary", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN completion_status = 'Completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN completion_status IN ('Not Started', 'Ongoing') THEN 1 ELSE 0 END) AS incomplete
    FROM task_assignment
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching task assignment summary:", err);
      return res.status(500).json({ message: "Error fetching task assignment summary" });
    }

    const { total, completed, incomplete } = results[0];
    res.json({ total, completed, incomplete }); // ✅ use "incomplete" in response
  });
});


module.exports = router;