import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { IFieldError } from '../../shared/errors/domain';

export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    const fields: IFieldError[] = errors.flatMap((err) => {
      if (!err.constraints) return [];

      return Object.values(err.constraints).map((message) => ({
        field: err.property,
        message,
      }));
    });

    return new BadRequestException({
      statusCode: 400,
      message: 'Bad Request',
      fields,
    });
  },
});
