import type { ErrorCode } from '../../../../shared/index';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public title: string;

  constructor(status: number, message: string, code: string, title?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.title = title || 'Error';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST') {
    return new ApiError(400, message, code, 'Bad Request');
  }

  static notFound(message: string, code: string = 'NOT_FOUND') {
    return new ApiError(404, message, code, 'Not Found');
  }

  static unauthorized(message: string, code: string = 'UNAUTHORIZED') {
    return new ApiError(401, message, code, 'Unauthorized');
  }

  static internal(message: string, code: string = 'INFRA_001') {
    return new ApiError(503, message, code, 'Service Unavailable');
  }
}
