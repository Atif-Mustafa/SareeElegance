import type { IsoTimestamp } from '../../types/common';
import type { RequestId } from '../ids/identifiers';

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta: {
    timestamp: IsoTimestamp;
    requestId: RequestId;
  };
}
