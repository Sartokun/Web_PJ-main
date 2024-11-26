const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
const eventBackend = require('./backend/event_backend.js');
const infoBackend = require('./backend/info_backend.js');
const joinEventBackend = require('./backend/joinEvent_backend.js');
const participatedEvents = require('./backend/participatedEvents.js');
const C_Event_backend = require('./backend/C_Event_backend.js');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/api', eventBackend);
app.use('/api', infoBackend);
app.use('/api', joinEventBackend);
app.use('/api', participatedEvents);
app.use('/api', C_Event_backend);

// ใส่ค่าตามที่เราตั้งไว้ใน mysql
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web_pj"
})

con.connect(err => {
    if(err) throw(err);
    else{
        console.log("server.js : MySQL connected");
    }
})

const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

//ทำให้สมบูรณ์
app.post('/regisDB', async (req, res) => {
    let { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.redirect('register.html?error=1');
    }

    let now_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let query = `
        CREATE TABLE IF NOT EXISTS userinfo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            date VARCHAR(255),
            profilepic VARCHAR(255) DEFAULT 'avatar.png'
        )`;
    await queryDB(query);

    let query2 = `
        INSERT INTO userinfo (username, password, date)
        VALUES ('${username}', '${password}', '${now_date}')`;
    await queryDB(query2);

    return res.redirect('login.html');
});

//ทำให้สมบูรณ์
app.get('/logout', (req,res) => {
    res.clearCookie('username');
    res.clearCookie('img');
    res.clearCookie('userId');
    return res.redirect('login.html');
})

//ทำให้สมบูรณ์
app.post('/checkLogin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect('login.html?error=1');
    }

    const query = 'SELECT id, username, password, profilepic FROM userinfo WHERE username = ? AND password = ?';
    con.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.redirect('login.html?error=1');
        }

        if (results.length > 0) {
            // เก็บ userId ในคุกกี้
            res.cookie('userId', results[0].id);
            res.cookie('username', username);
            res.cookie('img', results[0].profilepic);
            return res.redirect('home.html');
        } else {
            return res.redirect('login.html?error=1');
        }
    });
});

app.get('/api/events', async (req, res) => {
    try {
        // คำสั่ง SQL เพื่อดึงข้อมูลกิจกรรมจากฐานข้อมูล
        const events = await queryDB("SELECT * FROM events");
        // ส่งข้อมูลเป็น JSON
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

app.get('/api/infos', async (req, res) => {
    try {
        // คำสั่ง SQL เพื่อดึงข้อมูลกิจกรรมจากฐานข้อมูล
        const events = await queryDB("SELECT * FROM info");
        // ส่งข้อมูลเป็น JSON
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

app.get('/api/create_events', async (req, res) => {
    try {
        // คำสั่ง SQL เพื่อดึงข้อมูลกิจกรรมจากฐานข้อมูล
        const events = await queryDB("SELECT * FROM events");
        // ส่งข้อมูลเป็น JSON
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
});

 app.listen(port, hostname, () => {
        console.log(`Server running at   http://${hostname}:${port}/login.html`);
});