import type { z } from 'zod';
import type { philTVApiParamsSchemas } from '../schemas/philtvApi.schema';

/**
 * Parameters required to initialize the `PhilTVApiBase` class.
 *
 * This object includes the API connection details and optional configuration settings.
 */
export type PhilTVApiParams = z.infer<typeof philTVApiParamsSchemas>;
export type { GetFullAmbilightInformationResult } from '../lib/api/ambilight/getFullInformation';
export type * from './jointspace';
export type * from './jointspace-api.types';
