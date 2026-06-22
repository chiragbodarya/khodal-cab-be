const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const router = require('./routes');

const errorHandler = require('./middlewares/errors');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.use('/api/v1', router);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
