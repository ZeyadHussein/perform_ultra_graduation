const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Adjust the path as necessary

// GET all events for a user
router.get('/calendar/:User_ID', (req, res) => {
  const { User_ID } = req.params;
  console.log(User_ID)
  db.query('SELECT * FROM `calendar_event` WHERE `User_ID` = ?', [User_ID], (err, results) => {
    console.log(results);
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// POST new event
router.post('/calendar', (req, res) => {
  const { User_ID, Title, Description, Start_Time, End_Time, Event_Type, Location } = req.body;
  const query = `
    INSERT INTO calendar_event (User_ID, Title, Description, Start_Time, End_Time, Event_Type, Location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [User_ID, Title, Description, Start_Time, End_Time, Event_Type, Location], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ Event_ID: result.insertId });
  });
});

module.exports = router;
