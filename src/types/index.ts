import type { z } from 'zod';
import type { philTVApiParamsSchemas } from '../schemas/philtvApi.schema';

/**
 * Parameters required to initialize the `PhilTVApiBase` class.
 *
 * This object includes the API connection details and optional configuration settings.
 */
export type PhilTVApiParams = z.infer<typeof philTVApiParamsSchemas>;

export type FlatNode = {
  node_id: number;
  type: string;
  string_id?: string;
  context?: string;
  data?: unknown;
};

export type * from './jointspace';
