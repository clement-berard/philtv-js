import type { getHttpDigestClient } from '../../http-clients/http-digest-client';
import { inputKeysSchema } from '../../schemas/jointspace.schema';
import type { InputKey } from '../../types';

export class InputApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Sends a key press event to the device.
   * @param key - The input key to send.
   * @throws If the provided key fails schema validation or the request fails.
   */
  async sendKey(key: InputKey): Promise<void> {
    const _key = inputKeysSchema.parse(key);

    const res = await this.digestClient.request('input/key', {
      method: 'POST',
      data: {
        key: _key,
      },
    });

    if (!res.success) {
      throw res.error;
    }
  }
}
