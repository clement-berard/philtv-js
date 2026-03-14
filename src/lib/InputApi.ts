import type { getHttpDigestClient } from '../http-clients/http-digest-client';
import { inputKeysSchema } from '../schemas/jointspace.schema';
import type { InputKeys } from '../types';

export class InputApi {
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  sendKey(key: InputKeys) {
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
