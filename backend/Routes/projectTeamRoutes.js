const express = require('express');
const router = express.Router();
const pool = require('../db/db'); // Standard mysql connection

// ✅ Get teams assigned to a specific project
router.get('/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const query = `
    SELECT t.* FROM team t
    JOIN project_team pt ON t.Team_ID = pt.team_ID
    WHERE pt.Project_ID = ?
  `;
  pool.query(query, [projectId], (err, rows) => {
    if (err) {
      console.error('Error fetching project teams:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
// ✅ Get all teams
router.get('/all-teams', (req, res) => {
  const query = 'SELECT Team_ID, Team_name FROM team';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// ✅ Assign a team to a project
router.post('/assign', (req, res) => {
  const { Project_ID, team_ID, assign_date } = req.body;

  if (!Project_ID || !team_ID) {
    return res.status(400).json({ error: 'Project_ID and team_ID are required' });
  }

  const query = 'INSERT INTO project_team (Project_ID, team_ID, assign_date) VALUES (?, ?, ?)';
  pool.query(query, [Project_ID, team_ID, assign_date || null], (err, result) => {
    if (err) {
      console.error('Error assigning team:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Team assigned to project', id: result.insertId });
  });
});

module.exports = router;
