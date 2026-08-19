import type { ErrorCode } from '../../errors/error-codes';
import type { RequestId } from '../ids/identifiers';

/**
 * RFC 7807 Problem Details for HTTP APIs.
 * The canonical response format for all API errors.
 */
export interface ApiProblem {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  detail: string;
  instance?: string;
  requestId: RequestId;
}
