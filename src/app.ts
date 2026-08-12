import { Request, Response, NextFunction } from 'express';
import express  from 'express';
import cors  from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import cookieParser  from 'cookie-parser';
import router  from './routes';

import errorHandler  from './middlewares/errors';

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to load cross-origin
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for images
import path  from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Base Route
app.use('/api/v1', router);

// 404 Route
app.use((req: any, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error Handler
app.use(errorHandler);

export default app;
