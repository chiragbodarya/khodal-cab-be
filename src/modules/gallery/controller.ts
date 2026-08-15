import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/errors';
import prisma from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const getGalleries = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { category, search } = req.query;
    const filter: any = {};
    if (category) filter.category = category;

    if (search) {
      filter.title = { contains: search, mode: 'insensitive' };
    }

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gallery.count({ where: filter }),
    ]);

    sendResponse({
      res,
      statusCode: 200,
      data: galleries,
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

const getGalleryById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
    });

    if (!gallery) {
      return next(new AppError('Gallery item not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const createGallery = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, category, title } = req.body;

    if (!imageUrl || !category) {
      return next(new AppError('Please provide imageUrl and category.', 400, 'VALIDATION_ERROR'));
    }

    const gallery = await prisma.gallery.create({
      data: {
        imageUrl,
        category,
        title,
      },
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Gallery item created successfully.',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const updateGallery = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { imageUrl, category, title } = req.body;

    const existing = await prisma.gallery.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Gallery item not found.', 404, 'NOT_FOUND'));
    }

    const updatedData: any = {};
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (category !== undefined) updatedData.category = category;
    if (title !== undefined) updatedData.title = title;

    const gallery = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Gallery item updated successfully.',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGallery = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.gallery.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return next(new AppError('Gallery item not found.', 404, 'NOT_FOUND'));
    }

    await prisma.gallery.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Gallery item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
};
export default controller;
