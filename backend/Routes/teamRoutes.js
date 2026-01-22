const express = require("express");
const router = express.Router();
const pool = require("../db/db");



// Get all teams with department names
router.get("/teams", (req, res) => {
  console.log("📥 [GET] /teams called");

  const query = `
    SELECT 
      t.team_id, 
      t.team_name, 
      t.department_id, 
      d.Department_name AS department_name
    FROM team t
    LEFT JOIN department d ON t.department_id = d.Department_ID
    ORDER BY t.team_name
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching teams:", err.message);
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }

    console.log("✅ Query results:", results);
    res.json(results);
  });
});

// Add a new team
router.post("/teams", (req, res) => {
  const { team_name, department_id } = req.body;

  if (!team_name || team_name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Team name must be at least 3 characters",
    });
  }

  pool.query(
    "SELECT team_id FROM team WHERE team_name = ?",
    [team_name],
    (err, existing) => {
      if (err) {
        console.error("❌ Error checking existing team:", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Team already exists",
        });
      }

      pool.query(
        "INSERT INTO team (team_name, department_id) VALUES (?, ?)",
        [team_name, department_id || null],
        (err, result) => {
          if (err) {
            console.error("❌ Error inserting team:", err.message);
            return res.status(500).json({ success: false, message: "Server error" });
          }

          const newId = result.insertId;
          const getQuery = `
            SELECT 
              t.team_id, 
              t.team_name, 
              t.department_id, 
              d.Department_name AS department_name
            FROM team t
            LEFT JOIN department d ON t.department_id = d.Department_ID
            WHERE t.team_id = ?
          `;

          pool.query(getQuery, [newId], (err, team) => {
            if (err) {
              console.error("❌ Error fetching new team:", err.message);
              return res.status(500).json({ success: false, message: "Server error" });
            }

            res.status(201).json({
              success: true,
              message: "Team created successfully",
              team: team[0],
            });
          });
        }
      );
    }
  );
});

// Delete a team
router.delete("/teams/:id", (req, res) => {
  const { id } = req.params;

  pool.query("SELECT team_id FROM team WHERE team_id = ?", [id], (err, existing) => {
    if (err) {
      console.error("❌ Error checking team existence:", err.message);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    pool.query("DELETE FROM team WHERE team_id = ?", [id], (err) => {
      if (err) {
        console.error("❌ Error deleting team:", err.message);

        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return res.status(400).json({
            success: false,
            message: "Cannot delete team as it's being used in other records",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Server error while deleting team",
        });
      }

      res.json({
        success: true,
        message: "Team deleted successfully",
      });
    });
  });
});



module.exports = router;
