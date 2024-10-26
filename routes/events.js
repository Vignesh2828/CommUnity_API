const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new event
router.post('/create', (req, res) => {
    const { user_id, event_title, event_description, event_images, event_lat, event_lon, event_city } = req.body;

    if (!user_id || !event_title || !event_description || !event_lat || !event_lon || !event_city) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO events (user_id, event_title, event_description, event_images, event_lat, event_lon, event_city) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [user_id, event_title, event_description, JSON.stringify(event_images), event_lat, event_lon, event_city], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error creating event', error: err });
        }
        res.status(201).json({ event_id: results.insertId, message: 'Event created successfully' });
    });
});

// Get all events
router.get('/', (req, res) => {
    db.query('SELECT * FROM events', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving events' });
        }
        res.json({ data: results });
    });
});

// Get a specific event by ID
router.get('/:event_id', (req, res) => {
    const event_id = req.params.event_id;

    if (!event_id) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    db.query('SELECT * FROM events WHERE event_id = ?', [event_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving event' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ data: results[0] });
    });
});

// Get events by a specific user ID
router.get('/user/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    db.query('SELECT * FROM events WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving events', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No events found for this user' });
        }

        res.json({ data: results });
    });
});


// Update an event
router.put('/:event_id', (req, res) => {
    const event_id = req.params.event_id;
    const { user_id, event_title, event_description, event_images, event_lat, event_lon, event_city } = req.body;

    if (!user_id || !event_title || !event_description || !event_lat || !event_lon || !event_city) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'UPDATE events SET user_id = ?, event_title = ?, event_description = ?, event_images = ?, event_lat = ?, event_lon = ?, event_city = ? WHERE event_id = ?';
    db.query(sql, [user_id, event_title, event_description, JSON.stringify(event_images), event_lat, event_lon, event_city, event_id], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error updating event', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event updated successfully' });
    });
});

// Delete an event
router.delete('/:event_id', (req, res) => {
    const event_id = req.params.event_id;

    db.query('DELETE FROM events WHERE event_id = ?', [event_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting event', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    });
});

module.exports = router;
