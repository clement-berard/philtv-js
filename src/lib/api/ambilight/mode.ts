import { ambilightModesSchema } from '../../../schemas/jointspace.schema';
import type { AmbilightMode, AmbilightModeResponse } from '../../../types';
import type { AmbilightApi } from '../AmbilightApi';

export function handleAmbilightMode(ambilightInstance: AmbilightApi) {
  async function getMode(): Promise<AmbilightModeResponse> {
    const res = await ambilightInstance.digestClient.request<AmbilightModeResponse>('ambilight/mode');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }

  async function setMode(mode: AmbilightMode): Promise<void> {
    const _mode = ambilightModesSchema.parse(mode);

    await ambilightInstance.digestClient.request('ambilight/mode', {
      method: 'POST',
      data: {
        current: _mode,
      },
    });
  }

  return {
    getMode,
    setMode,
  };
}
