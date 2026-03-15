import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import { inputKeysSchema } from '../schemas/jointspace.schema';
import type { InputKeys } from '../types';

/**
 * Provides methods to send input commands.
 */
export class InputApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Sends an input key command.
   *
   * @param key - The key to send, validated against the allowed input keys.
   * @returns A result object indicating success or failure.
   */
  sendKey(key: InputKeys): Promise<ApiResult> {
    try {
      const _key = inputKeysSchema.parse(key);

      return this.digestClient.request('input/key', {
        method: 'POST',
        data: {
          key: _key,
        },
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }
}
