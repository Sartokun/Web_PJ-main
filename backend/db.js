// db.js
const mysql = require('mysql2');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web_pj"
});

con.connect(err => {
    if(err) throw err;
    console.log("db.js : MySQL connected");
});

const queryDB = (query, params) => {
    return new Promise((resolve, reject) => {
        con.query(query, params, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

module.exports = { queryDB };
