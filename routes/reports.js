const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new report
router.post('/create', (req, res) => {
    const { user_id, service_id, report_category, report_images, report_description } = req.body;

    if (!user_id || !service_id || !report_category || !report_description) {
        return res.status(400).json({ message: 'User ID, Service ID, report category, and report description are required' });
    }

    const sql = `
        INSERT INTO reports (user_id, service_id, report_category, report_images, report_description) 
        VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, service_id, report_category, JSON.stringify(report_images), report_description], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error creating report', error: err });
        }
        res.status(201).json({ message: 'Report created successfully', report_id: results.insertId });
    });
});

// Get all reports
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM reports';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving reports', error: err });
        }
        res.json({ data: results });
    });
});

// Get a specific report by ID
router.get('/:report_id', (req, res) => {
    const { report_id } = req.params;

    if (!report_id) {
        return res.status(400).json({ message: 'Report ID is required' });
    }

    const sql = 'SELECT * FROM reports WHERE report_id = ?';

    db.query(sql, [report_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving report', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ data: results[0] });
    });
});

// Get all reports for a specific user
router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const sql = 'SELECT * FROM reports WHERE user_id = ?';

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving user reports', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No reports found for this user' });
        }

        res.json({ data: results });
    });
});

// Update a report
router.put('/:report_id', (req, res) => {
    const { report_id } = req.params;
    const { report_category, report_images, report_description } = req.body;

    if (!report_id) {
        return res.status(400).json({ message: 'Report ID is required' });
    }

    const sql = `
        UPDATE reports 
        SET report_category = ?, report_images = ?, report_description = ? 
        WHERE report_id = ?`;

    db.query(sql, [report_category, JSON.stringify(report_images), report_description, report_id], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error updating report', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ message: 'Report updated successfully' });
    });
});

// Delete a report
router.delete('/:report_id', (req, res) => {
    const { report_id } = req.params;

    if (!report_id) {
        return res.status(400).json({ message: 'Report ID is required' });
    }

    const sql = 'DELETE FROM reports WHERE report_id = ?';

    db.query(sql, [report_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting report', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ message: 'Report deleted successfully' });
    });
});

module.exports = router;
