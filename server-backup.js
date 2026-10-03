const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;
app.use(express.static(__dirname));


// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "kiran_academy"
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
    } else {
        console.log("MySQL connected successfully!");
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/contacts", (req, res) => {
    const sql = "SELECT * FROM contacts ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Database error:", err.message);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        res.redirect("/admin.html");
    } else {
        res.send("Invalid username or password");
    }
});

app.post("/contact", (req, res) => {
    console.log("FORM DATA:",req.body);
    const { name, email, subject, message } = req.body;

    const sql = `
        INSERT INTO contacts (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, subject, message], (err) => {
        if (err) {
            console.log("Database error:", err.message);
            return res.send("Something went wrong.");
        }

        res.send("Thank you! Your message has been saved.");
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});