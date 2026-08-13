import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import AppError from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { generateAdminAccessToken, generateRefreshTokenString } from '../../utils/token';
import prisma from '../../config/prisma';

const formatAdminResponse = (admin: any) => {
  const formatted = { ...admin };
  delete formatted.password;
  return formatted;
};

const login = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400, 'VALIDATION_ERROR'));
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return next(new AppError('Incorrect email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const accessToken = generateAdminAccessToken(admin);
    const refreshTokenStr = generateRefreshTokenString();

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken: refreshTokenStr
      }
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    sendResponse({
      res,
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshTokenStr,
        admin: formatAdminResponse(admin)
      }
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required.', 400, 'VALIDATION_ERROR'));
    }

    const admin = await prisma.admin.findFirst({
      where: { refreshToken: refreshToken }
    });

    if (!admin) {
      return next(new AppError('Invalid refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    const newAccessToken = generateAdminAccessToken(admin);
    const newRefreshTokenStr = generateRefreshTokenString();

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken: newRefreshTokenStr
      }
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenStr
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.admin.updateMany({
        where: { refreshToken: refreshToken },
        data: { refreshToken: null }
      }).catch(() => { });
    }

    res.clearCookie('accessToken');
    sendResponse({
      res,
      statusCode: 200,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    sendResponse({
      res,
      statusCode: 200,
      data: { admin: formatAdminResponse(req.admin) }
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400, 'VALIDATION_ERROR'));
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return next(new AppError('An admin with this email already exists.', 400, 'DUPLICATE_EMAIL'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Admin created successfully.',
      data: formatAdminResponse(admin)
    });
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.admin.count()
    ]);

    const formattedAdmins = admins.map(admin => formatAdminResponse(admin));

    sendResponse({
      res,
      statusCode: 200,
      data: formattedAdmins,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide currentPassword and newPassword.', 400, 'VALIDATION_ERROR'));
    }

    const admin = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
    if (!admin) {
      return next(new AppError('Admin not found.', 404, 'NOT_FOUND'));
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return next(new AppError('Incorrect current password.', 401, 'INVALID_CREDENTIALS'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword, refreshToken: null } // invalidate token on password change
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Optional: Prevent deleting the last admin or yourself
    if (req.admin.id === parseInt(id)) {
      return next(new AppError('You cannot delete yourself.', 400, 'VALIDATION_ERROR'));
    }

    const admin = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
    if (!admin) {
      return next(new AppError('Admin not found.', 404, 'NOT_FOUND'));
    }

    await prisma.admin.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Admin deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  login,
  refresh,
  logout,
  me,
  createAdmin,
  getAdmins,
  changePassword,
  deleteAdmin
};
export default controller;
