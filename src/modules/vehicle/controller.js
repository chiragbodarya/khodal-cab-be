const AppError = require('../../utils/errors');
const model = require('./model');

const getVehicles = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const vehicles = await model.findManyVehicles(filter);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await model.findVehicleById(parseInt(id));

    if (!vehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const { name, type, capacity, features, licensePlate, images, status } = req.body;

    if (!name || !type || capacity === undefined) {
      return next(new AppError('Please provide name, type, and capacity.', 400, 'VALIDATION_ERROR'));
    }

    const vehicle = await model.createVehicle({
      name,
      type,
      capacity: parseInt(capacity),
      features: Array.isArray(features) ? features : [],
      licensePlate,
      images: Array.isArray(images) ? images : [],
      status: status || 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully.',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, features, licensePlate, images, status } = req.body;

    const existingVehicle = await model.findVehicleById(parseInt(id));
    if (!existingVehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (type !== undefined) updatedData.type = type;
    if (capacity !== undefined) updatedData.capacity = parseInt(capacity);
    if (features !== undefined) updatedData.features = Array.isArray(features) ? features : [];
    if (licensePlate !== undefined) updatedData.licensePlate = licensePlate;
    if (images !== undefined) updatedData.images = Array.isArray(images) ? images : [];
    if (status !== undefined) updatedData.status = status;

    const vehicle = await model.updateVehicle(parseInt(id), updatedData);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingVehicle = await model.findVehicleById(parseInt(id));
    if (!existingVehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    await model.deleteVehicle(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
