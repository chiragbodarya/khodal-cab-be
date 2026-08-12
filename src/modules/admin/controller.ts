import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';

const formatAdminResponse = (admin: any) => {
  const formatted = { ...admin };
  delete formatted.password;
  return formatted;
};

const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    sendResponse({
      res,
      statusCode: 200,
      data: { admin: formatAdminResponse(req.admin) }
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  me
};
export default controller;
