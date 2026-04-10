require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Required for Vercel — allows express-rate-limit to work behind proxy
app.set('trust proxy', 1);

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, validate: { xForwardedForHeader: false } }));

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/menu',   require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '☕ Brewed & Co. API is running.' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cafe.html'));
});

app.get('/cafe.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'cafe.html'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Only start the local server when not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n☕ Brewed & Co. server running on http://localhost:${PORT}`);
    console.log(`📋 API Docs available at http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
