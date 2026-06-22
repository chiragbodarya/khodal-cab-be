const prisma = require('../../config/prisma');

const findAdminById = async (id) => {
  return await prisma.admin.findUnique({
    where: { id }
  });
};

module.exports = {
  findAdminById
};
