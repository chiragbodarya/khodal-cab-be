import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/errors';
import prisma from '../../config/prisma';
import { sendResponse } from '../../utils/response';

// Public: Create an Inquiry (Contact Us, Vehicle, Cab Plan, Tour Plan)
const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      type = 'CONTACT_US',
      name,
      email,
      phone,
      message,
      pickupLocation,
      dropLocation,
      travelDate,
      returnDate,
      passengers,
      vehicleId,
      cabPlanId,
      tourPlanId,
    } = req.body;

    if (!name || !phone) {
      throw new AppError('Name and phone number are required', 400);
    }

    const data: any = {
      type: type || 'CONTACT_US',
      name,
      email: email || null,
      phone,
      message: message || null,
      pickupLocation: pickupLocation || null,
      dropLocation: dropLocation || null,
      travelDate: travelDate ? new Date(travelDate) : null,
      returnDate: returnDate ? new Date(returnDate) : null,
      passengers: passengers ? parseInt(passengers) : null,
      vehicleId: vehicleId ? parseInt(vehicleId) : null,
      cabPlanId: cabPlanId ? parseInt(cabPlanId) : null,
      tourPlanId: tourPlanId ? parseInt(tourPlanId) : null,
    };

    const inquiry = await prisma.inquiry.create({
      data,
      include: {
        vehicle: {
          select: { id: true, name: true, category: true, pricePerKm: true, image: true },
        },
        cabPlan: {
          select: { id: true, packageName: true, tripRoute: true, pricePerPerson: true, image: true },
        },
        tourPlan: {
          select: { id: true, packageName: true, tripRoute: true, pricePerPerson: true, image: true },
        },
      },
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Inquiry submitted successfully. Our team will contact you soon.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Inquiries with Search, Filter & Pagination
const getInquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { type, status, isWorkedOn, search, followUp } = req.query;

    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (isWorkedOn !== undefined && isWorkedOn !== '') {
      filter.isWorkedOn = isWorkedOn === 'true';
    }

    if (search) {
      filter.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { message: { contains: search as string, mode: 'insensitive' } },
        { adminNotes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Follow-up date filter (e.g. today / overdue)
    if (followUp === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      filter.followUpDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (followUp === 'pending') {
      filter.followUpDate = {
        not: null,
      };
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            select: { id: true, name: true, category: true, pricePerKm: true, image: true },
          },
          cabPlan: {
            select: { id: true, packageName: true, tripRoute: true, pricePerPerson: true, image: true },
          },
          tourPlan: {
            select: { id: true, packageName: true, tripRoute: true, pricePerPerson: true, image: true },
          },
        },
      }),
      prisma.inquiry.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: inquiries,
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

// Admin: Get Single Inquiry by ID
const getInquiryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new AppError('Invalid Inquiry ID', 400);
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        vehicle: true,
        cabPlan: true,
        tourPlan: true,
      },
    });

    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    sendResponse({
      res,
      statusCode: 200,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Inquiry Status, Notes, Follow-up Date, Working State
const updateInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new AppError('Invalid Inquiry ID', 400);
    }

    const { status, isWorkedOn, adminNotes, followUpDate, lastContactedAt } = req.body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (isWorkedOn !== undefined) data.isWorkedOn = Boolean(isWorkedOn);
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (followUpDate !== undefined) {
      data.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    if (lastContactedAt !== undefined) {
      data.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : new Date();
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        cabPlan: true,
        tourPlan: true,
      },
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Inquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Inquiry
const deleteInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new AppError('Invalid Inquiry ID', 400);
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Inquiries Overview / Statistics
const getInquiryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [total, newInquiries, inProgress, callBackRequested, confirmed, todayFollowUps] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.inquiry.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.inquiry.count({ where: { status: 'CALL_BACK_REQUESTED' } }),
      prisma.inquiry.count({ where: { status: 'CONFIRMED' } }),
      prisma.inquiry.count({
        where: {
          followUpDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: {
        total,
        newInquiries,
        inProgress,
        callBackRequested,
        confirmed,
        todayFollowUps,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
};
