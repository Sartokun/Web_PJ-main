// joinEvent_backend.js
const express = require('express');
const router = express.Router();
const { queryDB } = require('./db');  // ถ้ามีการใช้ db.js

// เส้นทางสำหรับเข้าร่วมกิจกรรม
router.post('/joinEvent', async (req, res) => {
    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        // ตรวจสอบว่าผู้ใช้ได้เข้าร่วมกิจกรรมแล้วหรือไม่
        const existingEntry = await queryDB(
            'SELECT * FROM event_participants WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );

        if (existingEntry.length > 0) {
            return res.status(409).json({ message: 'Already joined' });
        }

        // เพิ่มการเข้าร่วมกิจกรรม
        await queryDB(
            'INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)',
            [userId, eventId]
        );

        res.status(200).json({ message: 'Event joined successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error joining event' });
    }
});

module.exports = router;
