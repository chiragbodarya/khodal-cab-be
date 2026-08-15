import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import AppError from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey12345';

// Authenticate admin session
const isAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access.', 401, 'UNAUTHORIZED')
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch admin from DB
    const admin = await prisma.admin.findUnique({
      where: { id: (decoded as any).adminId },
    });

    if (!admin) {
      return next(
        new AppError('The admin belonging to this token no longer exists.', 401, 'ADMIN_NOT_FOUND')
      );
    }

    // Attach admin/user to request object
    req.admin = admin;
    req.user = admin; // Backwards compatibility if needed
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your session has expired. Please refresh your token.', 401, 'TOKEN_EXPIRED')
      );
    }
    next(new AppError('Invalid token. Access denied.', 401, 'INVALID_TOKEN'));
  }
};

export { isAdmin };
