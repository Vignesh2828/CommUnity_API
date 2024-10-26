const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new service
router.post('/create', (req, res) => {
    const {
        user_id,
        service_title,
        service_description,
        service_category,
        service_price,
        service_lat,
        service_lon,
        service_city,
        service_images_urls,
        service_completed_works_images
    } = req.body;

    // Validate required fields
    if (!user_id || !service_title || !service_description || !service_category || !service_price || !service_lat || !service_lon || !service_city ||!service_images_urls) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
        INSERT INTO services (user_id, service_title, service_description, service_category, service_price, service_lat, service_lon, service_city, service_images_urls, service_completed_works_images) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, service_title, service_description, service_category, service_price, service_lat, service_lon, service_city, JSON.stringify(service_images_urls), JSON.stringify(service_completed_works_images)], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error creating service', error: err });
        }
        res.status(201).json({ message: 'Service created successfully', service_id: results.insertId });
    });
});

// Get all services
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM services';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving services', error: err });
        }
        res.json({ data: results });
    });
});

// Get a specific service by ID
router.get('/:service_id', (req, res) => {
    const { service_id } = req.params;

    if (!service_id) {
        return res.status(400).json({ message: 'Service ID is required' });
    }

    const sql = 'SELECT * FROM services WHERE service_id = ?';

    db.query(sql, [service_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving service', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ data: results[0] });
    });
});

// Update a service
router.put('/:service_id', (req, res) => {
    const { service_id } = req.params;
    const {
        service_title,
        service_description,
        service_category,
        service_price,
        service_lat,
        service_lon,
        service_city,
        service_images_urls,
        service_completed_works_images
    } = req.body;

    if (!service_id) {
        return res.status(400).json({ message: 'Service ID is required' });
    }

    const sql = `
        UPDATE services 
        SET service_title = ?, service_description = ?, service_category = ?, service_price = ?, service_lat = ?, service_lon = ?, service_city = ?, service_images_urls = ?, service_completed_works_images = ? 
        WHERE service_id = ?`;

    db.query(sql, [service_title, service_description, service_category, service_price, service_lat, service_lon, service_city, JSON.stringify(service_images_urls), JSON.stringify(service_completed_works_images), service_id], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Error updating service', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service updated successfully' });
    });
});

// Delete a service
router.delete('/:service_id', (req, res) => {
    const { service_id } = req.params;

    if (!service_id) {
        return res.status(400).json({ message: 'Service ID is required' });
    }

    const sql = 'DELETE FROM services WHERE service_id = ?';

    db.query(sql, [service_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting service', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service deleted successfully' });
    });
});

module.exports = router;
