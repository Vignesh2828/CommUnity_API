// reviews.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all reviews
router.get('/', (req, res) => {

    db.query('SELECT * FROM reviews', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving reviews' });
        }

        res.json({ data: results });
    });
});

// Get all reviews for a specific service
router.get('/:service_id', (req, res) => {
    const { service_id } = req.params;

    if (!service_id) {
        return res.status(400).json({ message: 'Service ID is required' });
    }

    db.query('SELECT * FROM reviews WHERE service_id = ?', [service_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving reviews' });
        }

        res.json({ data: results });
    });
});

// Get specific review by id
router.get('/view/:review_id', (req, res) => {
    const { review_id } = req.params;

    if (!review_id) {
        return res.status(400).json({ message: 'review_id is required' });
    }

    db.query('SELECT * FROM reviews WHERE review_id = ?', [review_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving reviews' });
        }

        res.json({ data: results });
    });
});

// Create a new review
router.post('/create/:service_id', (req, res) => {
    const { user_id, review_star, review_text, review_images } = req.body;
    const { service_id } = req.params;

    // Validate required fields
    if (!user_id || !service_id || !review_star || !review_text || !review_images) {
        return res.status(400).json({ message: 'User ID, service ID, review star, and review text are required' });
    }

    // SQL query to insert the review
    const sql = 'INSERT INTO reviews (user_id, service_id, review_star, review_text, review_images) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [user_id, service_id, review_star, review_text, JSON.stringify(review_images)], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error creating review', error: err });
        }
        res.status(201).json({ message: 'Review added successfully', review_id: results.insertId });
    });
});


// Update a review
router.put('/:review_id', (req, res) => {
    const { review_id } = req.params;
    const { review_star, review_text, review_images } = req.body;

    if (!review_star && !review_text) {
        return res.status(400).json({ message: 'At least one field (review_star or review text) must be provided for update' });
    }

    const updates = [];
    const values = [];

    if (review_star) {
        updates.push('review_star = ?');
        values.push(review_star);
    }

    if (review_text) {
        updates.push('review_text = ?');
        values.push(review_text);
    }

    if (review_images) {
        updates.push('review_images = ?');
        values.push(JSON.stringify(review_images));
    }

    values.push(review_id);

    const sql = `UPDATE reviews SET ${updates.join(', ')} WHERE review_id = ?`;
    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error updating review', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    });
});

// Delete a review
router.delete('/:review_id', (req, res) => {
    const { review_id } = req.params;

    if (!review_id) {
        return res.status(400).json({ message: 'Review ID is required' });
    }

    db.query('DELETE FROM reviews WHERE review_id = ?', [review_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting review', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    });
});

module.exports = router;
