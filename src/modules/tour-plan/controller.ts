import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/errors';
import prisma from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const getTourPlans = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, minPrice, maxPrice, days } = req.query;
    const filter: any = { isActive: true };

    if (search) {
      filter.OR = [
        { packageName: { contains: search, mode: 'insensitive' } },
        { tripRoute: { contains: search, mode: 'insensitive' } },
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
    const [tourPlans, total] = await Promise.all([
      prisma.tourPlan.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourPlan.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlans,
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

const getAdminTourPlans = async (req: any, res: Response, next: NextFunction) => {
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
        { tripRoute: { contains: search, mode: 'insensitive' } },
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
    const [tourPlans, total] = await Promise.all([
      prisma.tourPlan.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourPlan.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlans,
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

const getTourPlanById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const filter: any = { id: parseInt(id), isActive: true };

    const tourPlan = await prisma.tourPlan.findFirst({
      where: filter,
    });

    if (!tourPlan) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlan,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTourPlanById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tourPlan = await prisma.tourPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tourPlan) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlan,
    });
  } catch (error) {
    next(error);
  }
};

const createTourPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      packageName,
      packageDescription,
      days,
      nights,
      tripRoute,
      highlights,
      pricePerPerson,
      startDate,
      endDate,
      image,
      isActive,
    } = req.body;

    if (!packageName || !days || !nights || !tripRoute || pricePerPerson === undefined) {
      return next(
        new AppError(
          'Please provide packageName, days, nights, tripRoute, and pricePerPerson.',
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    const tourPlan = await prisma.tourPlan.create({
      data: {
        packageName,
        packageDescription,
        days: parseInt(days),
        nights: parseInt(nights),
        tripRoute,
        highlights: Array.isArray(highlights) ? highlights : [],
        pricePerPerson: parseFloat(pricePerPerson),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        image,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Tour plan created successfully.',
      data: tourPlan,
    });
  } catch (error) {
    next(error);
  }
};

const updateTourPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      packageName,
      packageDescription,
      days,
      nights,
      tripRoute,
      highlights,
      pricePerPerson,
      startDate,
      endDate,
      image,
      isActive,
    } = req.body;

    const existing = await prisma.tourPlan.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    const updatedData: any = {};
    if (packageName !== undefined) updatedData.packageName = packageName;
    if (packageDescription !== undefined) updatedData.packageDescription = packageDescription;
    if (days !== undefined) updatedData.days = parseInt(days);
    if (nights !== undefined) updatedData.nights = parseInt(nights);
    if (tripRoute !== undefined) updatedData.tripRoute = tripRoute;
    if (highlights !== undefined)
      updatedData.highlights = Array.isArray(highlights) ? highlights : [];
    if (pricePerPerson !== undefined) updatedData.pricePerPerson = parseFloat(pricePerPerson);
    if (startDate !== undefined) updatedData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updatedData.endDate = endDate ? new Date(endDate) : null;
    if (image !== undefined) updatedData.image = image;
    if (isActive !== undefined) updatedData.isActive = Boolean(isActive);

    const tourPlan = await prisma.tourPlan.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Tour plan updated successfully.',
      data: tourPlan,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTourPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.tourPlan.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    await prisma.tourPlan.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Tour plan deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  getTourPlans,
  getAdminTourPlans,
  getTourPlanById,
  getAdminTourPlanById,
  createTourPlan,
  updateTourPlan,
  deleteTourPlan,
};
export default controller;
