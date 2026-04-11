import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { IFieldError } from '../../shared/errors/domain';

export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    const fields: IFieldError[] = errors.map((err) => ({
      field: err.property,
      messages: Object.values(err.constraints ?? {}),
    }));

    return new BadRequestException({
      statusCode: 400,
      message: 'Bad Request',
      fields,
    });
  },
});
