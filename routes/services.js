const express = require('express');
const router = express.Router();
const db = require('../db'); 

// Get all services
router.get('/', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving services' });
    }
    res.json({ data: results });
  });
});

// Get a specific service by ID
router.get('/:id', (req, res) => {
    const serviceId = req.params.id;
  
    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
  
    db.query('SELECT * FROM services WHERE service_id = ?', [serviceId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving service' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json({ data: results[0] }); 
    });
  });

// Create a new service
router.post('/', (req, res) => {
    const { name, description, latitude, longitude, city, price, image_urls,category } = req.body; 
    
    if (!name || !description || !latitude || !longitude || !price || !image_urls ||!city) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO services (name, description, latitude, longitude, city, price, image_urls, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, description, latitude, longitude, city, price, JSON.stringify(image_urls), category], (err, results) => {
      if (err) {
        return res.status(400).json({ message: 'Error creating service', error: err });
      }
      res.status(201).json({ id: results.insertId, name, description, price, image_urls });
    });
});

// Get services by category
router.get('/category/:category', (req, res) => {
  const category = req.params.category;

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  db.query('SELECT * FROM services WHERE category = ?', [category], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving services by category' });
    }
    
    res.json({ data: results });
  });
});

// Get services
router.get('/:id/reviews', (req, res) => {
  const serviceId = req.params.id;

  // Validate serviceId
  if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
  }

  db.query(`
      SELECT r.review_id, r.rating, r.review_text, r.created_at, r.image_urls, r.service_id
      FROM reviews r
      JOIN services s ON r.review_id = s.service_id
      WHERE r.service_id = ?`, [serviceId], (err, results) => {
          if (err) {
              return res.status(500).json({ message: 'Error retrieving reviews', error: err });
          }
        
          // Check if any reviews were found
          if (results.length === 0) {
              return res.status(404).json({ message: 'No reviews found for this service' });
          }
        
          res.json({ data: results });
      });
});

// post reviews
router.post('/reviews', (req,res) => {
  const {service_id, rating, review_text, image_urls} = req.body

  if(!service_id || !rating || !review_text ||!image_urls) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const sql = 'INSERT INTO reviews (service_id, rating, review_text, image_urls) VALUES (?,?,?,?)'
  db.query(sql, [service_id,rating,review_text, JSON.stringify(image_urls)], (err,results) => {
    if(err) {
      return res.status(400).json({ message: 'Error creating review', error: err });
    }
    res.status(201).json({ id: results.insertId, service_id, rating, review_text});
  })
})

module.exports = router;
