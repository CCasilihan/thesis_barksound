// userRoutes.js
const express = require('express');
const db = require('./db');
const { authenticateUser } = require('./authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const { secretKey } = require('./secret');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  const { name, password, username } = req.body;

  if (!name || !password || !username) {
    return res.status(400).json({ error: 'name, password, and username are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO Users (name, password, username) VALUES (?, ?, ?)';
  
    db.query(query, [name, hashedPassword, username], (err, result) => {
      if (err) {
        console.error('Error executing INSERT query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      return res.json({ message: 'User registered successfully', id: result.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const getUserQuery = 'SELECT * FROM Users WHERE username = ?';
    const [rows] = await db.promise().execute(getUserQuery, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
    
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all users
router.get('/users', (req, res) => {
  try {
    db.query('SELECT id, name, username FROM Users', (err, result) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      } else {
        return res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error('Error loading users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user details
router.put('/update/:id', authenticateUser, (req, res) => {
  const { id } = req.params;
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ error: 'name and username are required.' });
  } 

  const query = 'UPDATE Users SET name = ?, username = ? WHERE id = ?';

  db.query(query, [name, username, id], (err, result) => {
    if (err) {
      console.error('Error executing UPDATE query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User details updated successfully' });
  });
});

// Delete user
router.delete('/delete/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const checkUserQuery = 'SELECT * FROM Users WHERE id = ?';
    const [userRows] = await db.promise().query(checkUserQuery, [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deleteQuery = 'DELETE FROM Users WHERE id = ?';
    await db.promise().query(deleteQuery, [id]);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error executing DELETE query:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout endpoint
router.post('/logout', authenticateUser, (req, res) => {
  // Perform logout logic here
  // You might want to invalidate the token or clear the session
  return res.json({ message: 'Logout successful' });
});

module.exports = router;
