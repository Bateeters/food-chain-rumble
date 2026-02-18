const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // React app will run on port 3000
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
const routes = require('./routes/index');
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});