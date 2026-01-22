const express = require('express');
const router = express.Router();
const pool = require('../db/db'); // Your mysql2 pool without promise wrapper

// Get all projects
router.get('/', (req, res) => {
  pool.query('SELECT * FROM project', (err, rows) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single project by id
router.get('/:id', (req, res) => {
  pool.query(
    'SELECT * FROM project WHERE Project_ID = ?',
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error('Error fetching project by ID:', err);
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0)
        return res.status(404).json({ error: 'Project not found' });
      res.json(rows[0]);
    }
  );
});

// Create new project
router.post('/', (req, res) => {
  const { Project_name, Start_date, End_date, Budget } = req.body;

  if (!Project_name) {
    return res.status(400).json({ error: 'Project_name is required' });
  }

  pool.query(
    'INSERT INTO project (Project_name, Start_date, End_date, Budget) VALUES (?, ?, ?, ?)',
    [Project_name, Start_date || null, End_date || null, Budget !== undefined ? Budget : null],
    (err, result) => {
      if (err) {
        console.error('Error creating project:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Project created', id: result.insertId });
    }
  );
});

// Update project
router.put('/:id', (req, res) => {
  const { Project_name, Start_date, End_date, Budget } = req.body;

  if (!Project_name) {
    return res.status(400).json({ error: 'Project_name is required' });
  }

  pool.query(
    'UPDATE project SET Project_name = ?, Start_date = ?, End_date = ?, Budget = ? WHERE Project_ID = ?',
    [Project_name, Start_date || null, End_date || null, Budget !== undefined ? Budget : null, req.params.id],
    (err, result) => {
      if (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Project not found' });
      res.json({ message: 'Project updated' });
    }
  );
});

// Delete project
router.delete('/:id', (req, res) => {
  // First delete from project_team table to avoid foreign key constraints if any
  pool.query('DELETE FROM project_team WHERE Project_ID = ?', [req.params.id], (err) => {
    if (err) {
      console.error('Error deleting project_team:', err);
      return res.status(500).json({ error: err.message });
    }

    // Then delete from project table
    pool.query('DELETE FROM project WHERE Project_ID = ?', [req.params.id], (err, result) => {
      if (err) {
        console.error('Error deleting project:', err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Project not found' });
      res.json({ message: 'Project deleted' });
    });
  });
});

module.exports = router;
