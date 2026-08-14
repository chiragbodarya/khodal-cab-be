import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey12345';
const JWT_EXPIRES_IN = '1h'; // Let's make it 1h for convenience in travel app admin panel, or keep it short

const generateAccessToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, role: user.role, organizationId: user.organizationId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const generateAdminAccessToken = (admin: any) => {
  return jwt.sign({ adminId: admin.id, email: admin.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

export { generateAccessToken, generateAdminAccessToken, generateRefreshTokenString };
