import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/errors';
import prisma from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const getVehicles = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { category, search, minPrice, maxPrice, minSeats } = req.query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    if (search) {
      filter.name = { contains: search, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      filter.pricePerKm = {};
      if (minPrice) filter.pricePerKm.gte = parseFloat(minPrice as string);
      if (maxPrice) filter.pricePerKm.lte = parseFloat(maxPrice as string);
    }
    if (minSeats) {
      filter.seatCapacity = { gte: parseInt(minSeats as string) };
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: vehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminVehicles = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { isActive, category, search, minPrice, maxPrice, minSeats } = req.query;
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;

    if (search) {
      filter.name = { contains: search, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      filter.pricePerKm = {};
      if (minPrice) filter.pricePerKm.gte = parseFloat(minPrice as string);
      if (maxPrice) filter.pricePerKm.lte = parseFloat(maxPrice as string);
    }
    if (minSeats) {
      filter.seatCapacity = { gte: parseInt(minSeats as string) };
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: vehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: parseInt(id), isActive: true },
      include: { cabPlans: true },
    });

    if (!vehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminVehicleById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
      include: { cabPlans: true },
    });

    if (!vehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, seatCapacity, features, pricePerKm, image, isActive } =
      req.body;

    if (!name || !category || seatCapacity === undefined || pricePerKm === undefined) {
      return next(
        new AppError(
          'Please provide name, category, seatCapacity, and pricePerKm.',
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        description,
        category,
        seatCapacity: parseInt(seatCapacity),
        features: Array.isArray(features) ? features : [],
        pricePerKm: parseFloat(pricePerKm),
        image,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Vehicle created successfully.',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, category, seatCapacity, features, pricePerKm, image, isActive } =
      req.body;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } });
    if (!existingVehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (category !== undefined) updatedData.category = category;
    if (seatCapacity !== undefined) updatedData.seatCapacity = parseInt(seatCapacity);
    if (features !== undefined) updatedData.features = Array.isArray(features) ? features : [];
    if (pricePerKm !== undefined) updatedData.pricePerKm = parseFloat(pricePerKm);
    if (image !== undefined) updatedData.image = image;
    if (isActive !== undefined) updatedData.isActive = Boolean(isActive);

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Vehicle updated successfully.',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } });
    if (!existingVehicle) {
      return next(new AppError('Vehicle not found.', 404, 'NOT_FOUND'));
    }

    await prisma.vehicle.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Vehicle deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  getVehicles,
  getAdminVehicles,
  getVehicleById,
  getAdminVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
export default controller;
