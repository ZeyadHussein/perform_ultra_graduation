const express = require('express');
const router = express.Router();
const db = require('../db/db');

// 🟢 Get chat contacts
router.get('/list/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT 
      u.User_ID, u.Name, u.Email, 
      MAX(c.Time) as lastTime,
      SUBSTRING_INDEX(GROUP_CONCAT(c.Message ORDER BY c.Time DESC), ',', 1) as lastMessage
    FROM user u
    JOIN chats c ON (u.User_ID = c.Sender_ID OR u.User_ID = c.Receiver_ID)
    WHERE (c.Sender_ID = ? OR c.Receiver_ID = ?) AND u.User_ID != ?
    GROUP BY u.User_ID, u.Name, u.Email
    ORDER BY lastTime DESC
  `;

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 🟢 Get messages between two users
router.get('/:senderId/:receiverId', (req, res) => {
  const { senderId, receiverId } = req.params;
  db.query(
    `SELECT * FROM chats 
     WHERE (Sender_ID = ? AND Receiver_ID = ?) 
        OR (Sender_ID = ? AND Receiver_ID = ?) 
     ORDER BY Time ASC`,
    [senderId, receiverId, receiverId, senderId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// 🟢 Send a message
router.post('/', (req, res) => {
  const { Sender_ID, Receiver_ID, Message } = req.body;
  db.query(
    'INSERT INTO chats (Sender_ID, Receiver_ID, Message) VALUES (?, ?, ?)',
    [Sender_ID, Receiver_ID, Message],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      db.query('SELECT * FROM chats WHERE Chat_ID = ?', [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json(rows[0]);
      });
    }
  );
});

module.exports = router;
