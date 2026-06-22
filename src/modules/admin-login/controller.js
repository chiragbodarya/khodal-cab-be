const bcrypt = require('bcrypt');
const AppError = require('../../utils/errors');
const { generateAdminAccessToken, generateRefreshTokenString } = require('../../utils/token');
const model = require('./model');

const formatAdminResponse = (admin) => {
  const formatted = { ...admin };
  delete formatted.password;
  return formatted;
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400, 'VALIDATION_ERROR'));
    }

    const admin = await model.findAdminByEmail(email);
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return next(new AppError('Incorrect email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const accessToken = generateAdminAccessToken(admin);
    const refreshTokenStr = generateRefreshTokenString();

    await model.createRefreshToken(refreshTokenStr, admin.id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: refreshTokenStr,
      admin: formatAdminResponse(admin)
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required.', 400, 'VALIDATION_ERROR'));
    }

    const storedToken = await model.findRefreshToken(refreshToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await model.deleteRefreshTokensByAdminId(storedToken.adminId);
      }
      return next(new AppError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    await model.deleteRefreshToken(storedToken.id);

    const admin = storedToken.admin;
    const newAccessToken = generateAdminAccessToken(admin);
    const newRefreshTokenStr = generateRefreshTokenString();

    await model.createRefreshToken(newRefreshTokenStr, admin.id);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenStr
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await model.deleteRefreshTokenByToken(refreshToken).catch(() => {});
    }

    res.clearCookie('accessToken');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  logout
};
