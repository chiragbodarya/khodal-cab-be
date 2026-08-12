import { Request, Response, NextFunction } from 'express';
import AppError  from '../../utils/errors';
import prisma  from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const getTourPlans = async (req: any, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isActive: true };

    const tourPlans = await prisma.tourPlan.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlans,
      meta: { count: tourPlans.length }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTourPlans = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.query;
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const tourPlans = await prisma.tourPlan.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlans,
      meta: { count: tourPlans.length }
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
      where: filter
    });

    if (!tourPlan) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlan
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTourPlanById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tourPlan = await prisma.tourPlan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tourPlan) {
      return next(new AppError('Tour plan not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: tourPlan
    });
  } catch (error) {
    next(error);
  }
};

const createTourPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { packageName, packageDescription, days, nights, tripRoute, highlights, pricePerPerson, startDate, endDate, image, isActive } = req.body;

    if (!packageName || !days || !nights || !tripRoute || pricePerPerson === undefined) {
      return next(new AppError('Please provide packageName, days, nights, tripRoute, and pricePerPerson.', 400, 'VALIDATION_ERROR'));
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
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Tour plan created successfully.',
      data: tourPlan
    });
  } catch (error) {
    next(error);
  }
};

const updateTourPlan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { packageName, packageDescription, days, nights, tripRoute, highlights, pricePerPerson, startDate, endDate, image, isActive } = req.body;

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
    if (highlights !== undefined) updatedData.highlights = Array.isArray(highlights) ? highlights : [];
    if (pricePerPerson !== undefined) updatedData.pricePerPerson = parseFloat(pricePerPerson);
    if (startDate !== undefined) updatedData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updatedData.endDate = endDate ? new Date(endDate) : null;
    if (image !== undefined) updatedData.image = image;
    if (isActive !== undefined) updatedData.isActive = Boolean(isActive);

    const tourPlan = await prisma.tourPlan.update({
      where: { id: parseInt(id) },
      data: updatedData
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Tour plan updated successfully.',
      data: tourPlan
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
      message: 'Tour plan deleted successfully.'
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
  deleteTourPlan
};
export default controller;
