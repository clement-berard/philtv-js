import type { z } from 'zod';
import type { philTVApiParamsSchemas } from '../schemas/philtvApi.schema';

/**
 * Parameters required to initialize the `PhilTVApiBase` class.
 *
 * This object includes the API connection details and optional configuration settings.
 *
 * @internal
 */
export type PhilTVApiParams = z.infer<typeof philTVApiParamsSchemas>;

// export type FlatNodeType = 'SLIDER_NODE' | 'LIST_NODE' | 'TOGGLE_NODE' | string;
//
// /** @internal */
// export type FlatNode = {
//   node_id: number;
//   type: FlatNodeType;
//   string_id?: string;
//   context?: string;
//   data?: unknown;
// };

export type * from './jointspace';
export type * from './jointspace-api.types';
