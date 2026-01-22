const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// 🔹 Route to get all tasks
router.get("/tasks", (req, res) => {
    pool.query("SELECT * FROM task", (err, results) => {
        if (err) {
            console.error("❌ Error fetching tasks:", err);
            return res.status(500).json({ message: "Error fetching tasks" });
        }
        res.json(results);
    });
});

// 🔹 Route to get a single task by ID
router.get("/tasks/:id", (req, res) => {
    const { id } = req.params;

    pool.query("SELECT * FROM task WHERE task_ID = ?", [id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching task:", err);
            return res.status(500).json({ message: "Error fetching task" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(results[0]);
    });
});

// 🔹 Route to add a new task
router.post("/add-task", (req, res) => {
    const { task_title, description, Due_date, priority } = req.body;

    if (!task_title || !description || !priority) {
        return res.status(400).json({ 
            message: "Task title, description and priority are required",
            details: {
                received: req.body,
                required: ["task_title", "description", "priority"]
            }
        });
    }

    // Validate priority value
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
            message: "Invalid priority value",
            validValues: validPriorities
        });
    }

    pool.query(
        "INSERT INTO task (task_title, description, Due_date, priority) VALUES (?, ?, ?, ?)",
        [task_title, description, Due_date, priority],
        (err, result) => {
            if (err) {
                console.error("❌ Error adding task:", err);
                return res.status(500).json({ 
                    message: "Error adding task",
                    error: err.message,
                    sqlMessage: err.sqlMessage 
                });
            }
            res.status(201).json({ 
                message: "✅ Task added successfully", 
                taskId: result.insertId,
                taskData: {
                    task_title,
                    description,
                    Due_date,
                    priority
                }
            });
        }
    );
});


// 🔹 Route to update a task
router.put("/update-task/:id", (req, res) => {
    const { id } = req.params;
    const { task_title, description, Due_date, priority } = req.body;

    if (!task_title || !description || !priority) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Validate priority value
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
            message: "Invalid priority value",
            validValues: validPriorities
        });
    }

    pool.query(
        "UPDATE task SET task_title = ?, description = ?, Due_date = ?, priority = ? WHERE task_ID = ?",
        [task_title, description, Due_date, priority, id],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating task:", err);
                return res.status(500).json({ 
                    message: "Error updating task",
                    error: err.message
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json({ 
                message: "✅ Task updated successfully",
                updatedTask: {
                    task_ID: id,
                    task_title,
                    description,
                    Due_date,
                    priority
                }
            });
        }
    );
});

// 🔹 Route to delete a task
router.delete("/delete-task/:id", (req, res) => {
    const { id } = req.params;

    // First delete any task assignments for this task
    pool.query("DELETE FROM task_assignment WHERE task_ID = ?", [id], (err, result) => {
        if (err) {
            console.error("❌ Error deleting task assignments:", err);
            return res.status(500).json({ message: "Error deleting task assignments" });
        }

        // Then delete the task itself
        pool.query("DELETE FROM task WHERE task_ID = ?", [id], (err, result) => {
            if (err) {
                console.error("❌ Error deleting task:", err);
                return res.status(500).json({ message: "Error deleting task" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json({ 
                message: "✅ Task and its assignments deleted successfully",
                deletedTaskId: id
            });
        });
    });
});

// 🔹 Route to get tasks by priority
router.get("/tasks-by-priority/:priority", (req, res) => {
    const { priority } = req.params;

    // Validate priority value
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
            message: "Invalid priority value",
            validValues: validPriorities
        });
    }

    pool.query("SELECT * FROM task WHERE priority = ?", [priority], (err, results) => {
        if (err) {
            console.error("❌ Error fetching tasks by priority:", err);
            return res.status(500).json({ message: "Error fetching tasks by priority" });
        }
        res.json(results);
    });
});

// 🔹 Route to update task priority only
router.patch("/update-task-priority/:id", (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
        return res.status(400).json({ message: "Priority is required" });
    }

    // Validate priority value
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
            message: "Invalid priority value",
            validValues: validPriorities
        });
    }

    pool.query(
        "UPDATE task SET priority = ? WHERE task_ID = ?",
        [priority, id],
        (err, result) => {
            if (err) {
                console.error("❌ Error updating task priority:", err);
                return res.status(500).json({ message: "Error updating task priority" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json({ 
                message: "✅ Task priority updated successfully",
                taskId: id,
                newPriority: priority
            });
        }
    );
});

module.exports = router;