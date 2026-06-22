const AppError = require('../../utils/errors');
const model = require('./model');

const getTravelPlans = async (req, res, next) => {
  try {
    const { destination, origin, maxPrice, status } = req.query;
    const filter = {};

    if (destination) {
      filter.destination = { contains: destination, mode: 'insensitive' };
    }
    if (origin) {
      filter.origin = { contains: origin, mode: 'insensitive' };
    }
    if (maxPrice) {
      filter.price = { lte: parseFloat(maxPrice) };
    }
    if (status) {
      filter.status = status;
    }

    const plans = await model.findManyTravelPlans(filter);

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

const getTravelPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await model.findTravelPlanById(parseInt(id));

    if (!plan) {
      return next(new AppError('Travel plan not found.', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

const createTravelPlan = async (req, res, next) => {
  try {
    const {
      title,
      destination,
      origin,
      description,
      duration,
      price,
      departureTime,
      itinerary,
      highlights,
      images,
      vehicleId,
      status
    } = req.body;

    if (!title || !destination || !origin || !duration || price === undefined) {
      return next(new AppError('Please provide title, destination, origin, duration, and price.', 400, 'VALIDATION_ERROR'));
    }

    if (vehicleId) {
      const vehicle = await model.findVehicleById(parseInt(vehicleId));
      if (!vehicle) {
        return next(new AppError('Associated vehicle not found.', 400, 'INVALID_VEHICLE'));
      }
    }

    const plan = await model.createTravelPlan({
      title,
      destination,
      origin,
      description,
      duration,
      price: parseFloat(price),
      departureTime: departureTime ? new Date(departureTime) : null,
      itinerary: itinerary || null,
      highlights: Array.isArray(highlights) ? highlights : [],
      images: Array.isArray(images) ? images : [],
      vehicleId: vehicleId ? parseInt(vehicleId) : null,
      status: status || 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Travel plan created successfully.',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

const updateTravelPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      destination,
      origin,
      description,
      duration,
      price,
      departureTime,
      itinerary,
      highlights,
      images,
      vehicleId,
      status
    } = req.body;

    const existingPlan = await model.findTravelPlanById(parseInt(id));
    if (!existingPlan) {
      return next(new AppError('Travel plan not found.', 404, 'NOT_FOUND'));
    }

    if (vehicleId) {
      const vehicle = await model.findVehicleById(parseInt(vehicleId));
      if (!vehicle) {
        return next(new AppError('Associated vehicle not found.', 400, 'INVALID_VEHICLE'));
      }
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (destination !== undefined) updatedData.destination = destination;
    if (origin !== undefined) updatedData.origin = origin;
    if (description !== undefined) updatedData.description = description;
    if (duration !== undefined) updatedData.duration = duration;
    if (price !== undefined) updatedData.price = parseFloat(price);
    if (departureTime !== undefined) updatedData.departureTime = departureTime ? new Date(departureTime) : null;
    if (itinerary !== undefined) updatedData.itinerary = itinerary;
    if (highlights !== undefined) updatedData.highlights = Array.isArray(highlights) ? highlights : [];
    if (images !== undefined) updatedData.images = Array.isArray(images) ? images : [];
    if (vehicleId !== undefined) updatedData.vehicleId = vehicleId ? parseInt(vehicleId) : null;
    if (status !== undefined) updatedData.status = status;

    const plan = await model.updateTravelPlan(parseInt(id), updatedData);

    res.status(200).json({
      success: true,
      message: 'Travel plan updated successfully.',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

const deleteTravelPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingPlan = await model.findTravelPlanById(parseInt(id));
    if (!existingPlan) {
      return next(new AppError('Travel plan not found.', 404, 'NOT_FOUND'));
    }

    await model.deleteTravelPlan(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Travel plan deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelPlans,
  getTravelPlanById,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan
};
