import { Request, Response, NextFunction } from 'express';
import bcrypt  from 'bcrypt';
import AppError  from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { generateAdminAccessToken, generateRefreshTokenString }  from '../../utils/token';
import prisma  from '../../config/prisma';

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

    await prisma.adminRefreshToken.create({
      data: {
        token: refreshTokenStr,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

    const storedToken = await prisma.adminRefreshToken.findUnique({
      where: { token: refreshToken },
      include: { admin: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.adminRefreshToken.deleteMany({ where: { adminId: storedToken.adminId } });
      }
      return next(new AppError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    await prisma.adminRefreshToken.delete({ where: { id: storedToken.id } });

    const admin = storedToken.admin;
    const newAccessToken = generateAdminAccessToken(admin);
    const newRefreshTokenStr = generateRefreshTokenString();

    await prisma.adminRefreshToken.create({
      data: {
        token: newRefreshTokenStr,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
      await prisma.adminRefreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => { });
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

const controller = {
  login,
  refresh,
  logout
};
export default controller;
