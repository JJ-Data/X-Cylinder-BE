import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';
import { ResponseUtil } from '@utils/response';
import { logger } from '@utils/logger';
import { config } from '@config/environment';
import { CONSTANTS } from '@config/constants';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const error = err;

  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    ...(err instanceof AppError && { statusCode: err.statusCode }),
  });

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const errors: Record<string, string[]> = {};
    (error as any).errors.forEach((e: any) => {
      if (!errors[e.path]) {
        errors[e.path] = [];
      }
      errors[e.path]!.push(e.message);
    });

    ResponseUtil.validationError(res, errors);
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const errors: Record<string, string[]> = {};
    (error as any).errors.forEach((e: any) => {
      if (!errors[e.path]) {
        errors[e.path] = [];
      }
      errors[e.path]!.push(`${e.path} already exists`);
    });

    ResponseUtil.conflict(res, 'Resource already exists');
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    ResponseUtil.unauthorized(res, CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN, 'TOKEN_INVALID');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseUtil.unauthorized(res, CONSTANTS.ERROR_MESSAGES.TOKEN_EXPIRED, 'TOKEN_EXPIRED');
    return;
  }

  // Handle FK constraint violations (e.g. deleting a record still referenced elsewhere)
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    ResponseUtil.conflict(
      res,
      'This record cannot be deleted because it is still referenced by other records'
    );
    return;
  }

  // Handle operational errors
  if (error instanceof AppError) {
    if (error.errors) {
      ResponseUtil.error(res, error.message, error.statusCode, error.errors, error.code);
    } else {
      ResponseUtil.error(res, error.message, error.statusCode, undefined, error.code);
    }
    return;
  }

  // Handle unknown errors
  const message = config.isProduction ? CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR : error.message;

  ResponseUtil.error(res, message, CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
