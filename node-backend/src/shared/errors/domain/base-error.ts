export enum DomainErrorType {
  BAD_REQUEST = 'Bad Request',
  NOT_FOUND = 'Not Found',
  UNAUTHORIZED = 'Unauthorized',
  SERVER_ERROR = 'Server Error',
}

export interface IFieldError {
  field: string;
  messages: string[];
}

/**
 * Domain-level abstraction over Error
 *
 * Key characteristics:
 * - **Error type**: Categorizes the error (often mapped to HTTP status codes
 *   at the application or transport layer).
 * - **Developer message** (`message`): A technical description useful for logs
 *   or debugging.
 * - **User message** (`userMessage`): A safe, user-facing description that can
 *   be displayed in UI or API responses.
 * - **Field errors** (`errors`): Optional structured validation errors for
 *   specific fields or inputs.
 *
 * This separation allows the domain to express meaningful failures without
 * coupling itself to transport concerns such as HTTP responses.
 *
 */
export class BaseDomainError extends Error {
  public userMessage: string;
  public type: DomainErrorType;
  public errors: IFieldError[];

  constructor(
    args: {
      type: DomainErrorType;
      message: string;
      userMessage: string;
    },
    errors?: IFieldError[],
  ) {
    super(args.message);

    this.userMessage = args.userMessage;
    this.errors = errors || [];
    this.name = 'Domain Error';
    this.type = args.type;

    Object.setPrototypeOf(this, BaseDomainError.prototype);

    Error.captureStackTrace?.(this, this.constructor);
  }
}
