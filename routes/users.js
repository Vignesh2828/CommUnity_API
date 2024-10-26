const express = require('express');
const router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Login user
router.post('/login', (req, res) => {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user exists
    const sql = 'SELECT * FROM users WHERE user_email = ?';
    db.query(sql, [user_email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving user', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(user_password, user.user_password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                user_email: user.user_email,
                user_role: user.user_role,
                user_name: user.user_name,
                user_city : user.user_city,
                user_aadhar : user.user_aadhar,
                user_pan  :user.user_pan,
                user_phone : user.user_phone,
                user_whatsapp : user.user_whatsapp,
                user_address : user.user_address,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const userData = 
            {
                user_id: user.user_id,
                user_email: user.user_email,
                user_role: user.user_role,
                user_name: user.user_name,
                user_city : user.user_city,
                user_aadhar : user.user_aadhar,
                user_pan  :user.user_pan,
                user_phone : user.user_phone,
                user_whatsapp : user.user_whatsapp,
                user_address : user.user_address,
            }
           
    

        res.json({ token, user : userData, message: 'Login successful' });
    });
});

// Create user
router.post('/register', async (req, res) => {
    const { user_email, user_password, user_name, user_lat, user_lon, user_city } = req.body;

    if (!user_name || !user_email || !user_password || !user_lat || !user_lon || !user_city) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    const sql = 'INSERT INTO users (user_email, user_password, user_name, user_lat, user_lon, user_city) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_email, hashedPassword, user_name, user_lat, user_lon, user_city], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error creating user', error: err });
        }
        res.status(201).json({ user_id: results.insertId, message: 'User created successfully' });
    });
});


// Get user
router.get('/:user_id', (req,res) => {
    const user_id = req.params.user_id;

    if(!user_id){
        return res.status(400).json({ message: 'User ID is required' });
    }

    db.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error retrieving user' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ data: results[0] }); 
      });
})

// Update user
router.put('/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const allowedFields = [
        'user_email', 'user_password', 'user_name', 'user_image',
        'user_aadhar', 'user_pan', 'user_phone', 'user_whatsapp',
        'user_address', 'user_lat', 'user_lon', 'user_city', 'user_role'
    ];

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate input
    const updates = Object.entries(req.body).filter(([key]) => allowedFields.includes(key));
    if (updates.length === 0) {
        return res.status(400).json({ message: 'At least one field is required to update' });
    }

    // Build SQL query and values
    const sql = `UPDATE users SET ${updates.map(([key]) => `${key} = ?`).join(', ')} WHERE user_id = ?`;
    const values = [...updates.map(([, value]) => value), user_id];

    // Execute update query
    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating user', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

// Delete user
router.delete('/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    db.query('DELETE FROM users WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting user', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});



module.exports = router;
