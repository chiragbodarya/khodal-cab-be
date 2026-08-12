import { Response } from 'express';

export interface ResponseOptions {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: any;
  meta?: {
    count?: number;
    page?: number;
    limit?: number;
    total?: number;
    filters?: any;
    [key: string]: any;
  };
}

export const sendResponse = ({
  res,
  statusCode = 200,
  success = true,
  message,
  data,
  meta,
}: ResponseOptions) => {
  const response: any = {
    success,
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  if (meta !== undefined) response.meta = meta;

  return res.status(statusCode).json(response);
};
