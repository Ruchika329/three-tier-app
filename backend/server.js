require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

async function initDB() {
  let retries = 10;
  while (retries > 0) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword',
      });
      await conn.query(`CREATE DATABASE IF NOT EXISTS appdb`);
      await conn.query(`USE appdb`);
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await conn.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status ENUM('pending','in-progress','completed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      await conn.end();
      console.log('✅ Database initialized successfully!');
      break;
    } catch (err) {
      retries--;
      console.log(`DB not ready, retrying... (${retries} left): ${err.message}`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
});