import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/get-item-data", async (req, res) => {
    const { itemId } = req.body; 
    console.log('Received itemId:', itemId); 

    if (!itemId) {
        return res.status(400).json({ error: 'itemId is missing or invalid' });
    }

    try {
        const result = await db.query('SELECT * FROM item WHERE id = ($1)', [itemId]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]); 
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching item data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});
