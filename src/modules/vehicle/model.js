const prisma = require('../../config/prisma');

const findManyVehicles = async (filter) => {
  return await prisma.vehicle.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' }
  });
};

const findVehicleById = async (id) => {
  return await prisma.vehicle.findUnique({
    where: { id },
    include: { travelPlans: true }
  });
};

const createVehicle = async (data) => {
  return await prisma.vehicle.create({
    data
  });
};

const updateVehicle = async (id, data) => {
  return await prisma.vehicle.update({
    where: { id },
    data
  });
};

const deleteVehicle = async (id) => {
  return await prisma.vehicle.delete({
    where: { id }
  });
};

module.exports = {
  findManyVehicles,
  findVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
