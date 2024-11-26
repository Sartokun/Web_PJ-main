// info_backend.js
const express = require('express');
const { queryDB } = require('./db');
const router = express.Router();

router.get('/infos', async (req, res) => {
    try {
        // อ่านค่าจาก query parameter (ถ้าไม่มีจะใช้ค่า default เป็น 3)
        const limit = req.query.limit || 3;

        // ถ้ากำหนด limit เป็น 0 หรือไม่ได้กำหนด ให้ดึงข้อมูลทั้งหมด
        const query = limit == 0 
            ? "SELECT * FROM info ORDER BY date DESC" 
            : `SELECT * FROM info ORDER BY date DESC LIMIT ${limit}`;

        // ดึงข้อมูลจากฐานข้อมูล
        const events = await queryDB(query);

        res.json(events); // ส่งข้อมูลกลับไปยัง Frontend
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving info");
    }
});

module.exports = router;
