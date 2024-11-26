// event_backend.js
const express = require('express');
const { queryDB } = require('./db');
const router = express.Router();

// API ดึงข้อมูล event ตามจำนวนที่กำหนด
router.post('/create_events', async (req, res) => {
    const { name, date, description, image_path } = req.body;

    if (!name || !date || !description) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const sql = `INSERT INTO events (name, date, description, image_path) VALUES (?, ?, ?, ?)`;
        await queryDB(sql, [name, date, description, image_path || 'pic/default-event.png']);
        res.status(201).send("Event created successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating event");
    }
});

module.exports = router;
