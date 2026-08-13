import { Request, Response, NextFunction } from 'express';
import AppError  from '../../utils/errors';
import prisma  from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const getCabPlans = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, minPrice, maxPrice, days } = req.query;
    const filter: any = { isActive: true };

    if (search) {
      filter.OR = [
        { packageName: { contains: search, mode: 'insensitive' } },
        { tripRoute: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.gte = parseFloat(minPrice as string);
      if (maxPrice) filter.pricePerPerson.lte = parseFloat(maxPrice as string);
    }
    if (days) {
      filter.days = parseInt(days as string);
    }

    const [cabPlans, total] = await Promise.all([
      prisma.cabPlan.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true }
      }),
      prisma.cabPlan.count({ where: filter })
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: cabPlans,
      meta: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCabPlans = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { isActive, search, minPrice, maxPrice, days } = req.query;
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (search) {
      filter.OR = [
        { packageName: { contains: search, mode: 'insensitive' } },
        { tripRoute: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.gte = parseFloat(minPrice as string);
      if (maxPrice) filter.pricePerPerson.lte = parseFloat(maxPrice as string);
    }
    if (days) {
      filter.days = parseInt(days as string);
    }

    const [cabPlans, total] = await Promise.all([
      prisma.cabPlan.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true }
      }),
      prisma.cabPlan.count({ where: filter })
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: cabPlans,
      meta: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCabPlanById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cabPlan = await prisma.cabPlan.findFirst({
      where: { id: parseInt(id), isActive: true },
      include: { vehicle: true }
    });

    if (!cabPlan) {
      return next(new AppError('Cab plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: cabPlan
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCabPlanById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cabPlan = await prisma.cabPlan.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true }
    });

    if (!cabPlan) {
      return next(new AppError('Cab plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: cabPlan
    });
  } catch (error) {
    next(error);
  }
};

const createCabPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { packageName, packageDescription, days, nights, tripRoute, highlights, pricePerPerson, withDriver, driverFoodIncluded, image, vehicleId, isActive } = req.body;

    if (!packageName || !days || !nights || !tripRoute || pricePerPerson === undefined) {
      return next(new AppError('Please provide packageName, days, nights, tripRoute, and pricePerPerson.', 400, 'VALIDATION_ERROR'));
    }

    const cabPlan = await prisma.cabPlan.create({
      data: {
        packageName,
        packageDescription,
        days: parseInt(days),
        nights: parseInt(nights),
        tripRoute,
        highlights: Array.isArray(highlights) ? highlights : [],
        pricePerPerson: parseFloat(pricePerPerson),
        withDriver: withDriver !== undefined ? Boolean(withDriver) : true,
        driverFoodIncluded: driverFoodIncluded !== undefined ? Boolean(driverFoodIncluded) : false,
        image,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Cab plan created successfully.',
      data: cabPlan
    });
  } catch (error) {
    next(error);
  }
};

const updateCabPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { packageName, packageDescription, days, nights, tripRoute, highlights, pricePerPerson, withDriver, driverFoodIncluded, image, vehicleId, isActive } = req.body;

    const existing = await prisma.cabPlan.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Cab plan not found.', 404, 'NOT_FOUND'));
    }

    const updatedData: any = {};
    if (packageName !== undefined) updatedData.packageName = packageName;
    if (packageDescription !== undefined) updatedData.packageDescription = packageDescription;
    if (days !== undefined) updatedData.days = parseInt(days);
    if (nights !== undefined) updatedData.nights = parseInt(nights);
    if (tripRoute !== undefined) updatedData.tripRoute = tripRoute;
    if (highlights !== undefined) updatedData.highlights = Array.isArray(highlights) ? highlights : [];
    if (pricePerPerson !== undefined) updatedData.pricePerPerson = parseFloat(pricePerPerson);
    if (withDriver !== undefined) updatedData.withDriver = Boolean(withDriver);
    if (driverFoodIncluded !== undefined) updatedData.driverFoodIncluded = Boolean(driverFoodIncluded);
    if (image !== undefined) updatedData.image = image;
    if (vehicleId !== undefined) updatedData.vehicleId = vehicleId ? parseInt(vehicleId) : null;
    if (isActive !== undefined) updatedData.isActive = Boolean(isActive);

    const cabPlan = await prisma.cabPlan.update({
      where: { id: parseInt(id) },
      data: updatedData
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Cab plan updated successfully.',
      data: cabPlan
    });
  } catch (error) {
    next(error);
  }
};

const deleteCabPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.cabPlan.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Cab plan not found.', 404, 'NOT_FOUND'));
    }

    await prisma.cabPlan.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Cab plan deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  getCabPlans,
  getAdminCabPlans,
  getCabPlanById,
  getAdminCabPlanById,
  createCabPlan,
  updateCabPlan,
  deleteCabPlan
};
export default controller;
