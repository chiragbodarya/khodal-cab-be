const prisma = require('../../config/prisma');

const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({
    where: { email }
  });
};

const createRefreshToken = async (tokenStr, adminId) => {
  return await prisma.adminRefreshToken.create({
    data: {
      token: tokenStr,
      adminId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
};

const findRefreshToken = async (token) => {
  return await prisma.adminRefreshToken.findUnique({
    where: { token },
    include: { admin: true }
  });
};

const deleteRefreshToken = async (id) => {
  return await prisma.adminRefreshToken.delete({
    where: { id }
  });
};

const deleteRefreshTokensByAdminId = async (adminId) => {
  return await prisma.adminRefreshToken.deleteMany({
    where: { adminId }
  });
};

const deleteRefreshTokenByToken = async (token) => {
  return await prisma.adminRefreshToken.deleteMany({
    where: { token }
  });
};

module.exports = {
  findAdminByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteRefreshTokensByAdminId,
  deleteRefreshTokenByToken
};
