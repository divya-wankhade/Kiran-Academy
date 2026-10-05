const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();
console.log("MY SERVER.JS IS RUNNING");
const PORT = process.env.PORT || 3000;

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
});

console.log("MySQL connection pool created.");


app.use(session({
    secret: "kiran-academy-secret",
    resave: false,
    saveUninitialized: false
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Admin page
app.get("/admin.html", (req, res) => {
    if(!req.session.adminLoggedIn){
        return res.redirect("/admin-login.html");
    }
    res.sendFile(path.join(__dirname, "admin.html"));
});

// Get contact messages
app.get("/api/contacts", (req, res) => {
    const sql = "SELECT * FROM contacts ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Database error:", err.message);
            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json(results);
    });
});

// Admin login
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        req.session.adminLoggedIn = true;
        res.redirect("/admin.html");
    } else {
        res.send("Invalid username or password");
    }
});

// Contact form
app.post("/contact", (req, res) => {
    console.log("FORM DATA:", req.body);

    const { name, email, subject, message, massage} = req.body;

    const finalMessage = message || massage;

    const sql = `
        INSERT INTO contacts (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, subject, finalMessage],
        (err) => {
            if (err) {
                console.log("Database error:", err.message);
                return res.status(500).send("Something went wrong.");
            }

            console.log("Contact saved successfully!")

            res.send("Thank you! Your message has been saved.");
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});