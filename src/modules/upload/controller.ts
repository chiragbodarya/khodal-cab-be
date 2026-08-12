import { Request, Response, NextFunction } from 'express';
import fs  from 'fs';
import path  from 'path';
import AppError  from '../../utils/errors';
import { sendResponse } from '../../utils/response';

const uploadDir = path.join(__dirname, '../../../public/uploads');

// Upload a single image
const uploadImage = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400, 'VALIDATION_ERROR'));
    }
    
    // Construct the URL to the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    sendResponse({
      res,
      statusCode: 201,
      message: 'File uploaded successfully.',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
};

// List all images
const listImages = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return sendResponse({ res, statusCode: 200, data: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const fileList = files.map(filename => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    sendResponse({
      res,
      statusCode: 200,
      data: fileList,
      meta: { count: fileList.length }
    });
  } catch (error) {
    next(error);
  }
};

// Delete an image
const deleteImage = (req: any, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found.', 404, 'NOT_FOUND'));
    }

    fs.unlinkSync(filePath);

    sendResponse({
      res,
      statusCode: 200,
      message: 'File deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  uploadImage,
  listImages,
  deleteImage
};
export default controller;
