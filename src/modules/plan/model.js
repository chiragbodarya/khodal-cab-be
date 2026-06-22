const prisma = require('../../config/prisma');

const findManyTravelPlans = async (filter) => {
  return await prisma.travelPlan.findMany({
    where: filter,
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' }
  });
};

const findTravelPlanById = async (id) => {
  return await prisma.travelPlan.findUnique({
    where: { id },
    include: { vehicle: true }
  });
};

const createTravelPlan = async (data) => {
  return await prisma.travelPlan.create({
    data,
    include: { vehicle: true }
  });
};

const updateTravelPlan = async (id, data) => {
  return await prisma.travelPlan.update({
    where: { id },
    data,
    include: { vehicle: true }
  });
};

const deleteTravelPlan = async (id) => {
  return await prisma.travelPlan.delete({
    where: { id }
  });
};

const findVehicleById = async (vehicleId) => {
  return await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });
};

module.exports = {
  findManyTravelPlans,
  findTravelPlanById,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
  findVehicleById
};
