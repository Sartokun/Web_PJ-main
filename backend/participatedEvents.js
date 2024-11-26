const express = require('express');
const router = express.Router();
const { queryDB } = require('./db');  // นำเข้า queryDB จาก db.js

// สมมติว่าเราใช้ cookie สำหรับการระบุผู้ใช้
router.get('/participatedEvents', async (req, res) => {
    const userId = req.query.userId;  // ใช้ค่า userId จาก query parameter

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // ดึงกิจกรรมที่ผู้ใช้เข้าร่วมทั้งหมดจาก event_participants
    const sqlQuery = 'SELECT e.id, e.name, e.date, e.description, e.image_path FROM events e INNER JOIN event_participants ep ON e.id = ep.event_id WHERE ep.user_id = ?';

    try {
        const results = await queryDB(sqlQuery, [userId]);  // ใช้ queryDB ในการ query ฐานข้อมูล
        if (results.length > 0) {
            return res.json({ events: results });
        } else {
            return res.json({ events: [] });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
