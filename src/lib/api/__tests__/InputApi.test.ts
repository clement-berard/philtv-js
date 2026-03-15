import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inputKeysSchema } from '../../../schemas/jointspace.schema';
import { InputApi } from '../InputApi';

vi.mock('../../../schemas/jointspace.schema', () => ({
  inputKeysSchema: {
    parse: vi.fn(),
  },
}));

describe('InputApi', () => {
  let inputApi: InputApi;
  let mockDigestClient: any;

  beforeEach(() => {
    mockDigestClient = {
      request: vi.fn(),
    };
    inputApi = new InputApi(mockDigestClient);
    vi.clearAllMocks();
  });

  describe('sendKey', () => {
    it('should parse the key and send a POST request', async () => {
      const mockKey = 'Standby';
      (inputKeysSchema.parse as any).mockReturnValue(mockKey);
      mockDigestClient.request.mockResolvedValue({ success: true });

      await inputApi.sendKey(mockKey as any);

      expect(inputKeysSchema.parse).toHaveBeenCalledWith(mockKey);
      expect(mockDigestClient.request).toHaveBeenCalledWith('input/key', {
        method: 'POST',
        data: {
          key: mockKey,
        },
      });
    });

    it('should throw if the key schema validation fails', async () => {
      const validationError = new Error('Invalid key');
      (inputKeysSchema.parse as any).mockImplementation(() => {
        throw validationError;
      });

      await expect(inputApi.sendKey('InvalidKey' as any)).rejects.toThrow('Invalid key');
      expect(mockDigestClient.request).not.toHaveBeenCalled();
    });

    it('should throw if the API request fails', async () => {
      const mockKey = 'VolumeUp';
      (inputKeysSchema.parse as any).mockReturnValue(mockKey);

      const apiError = new Error('Network timeout');
      mockDigestClient.request.mockResolvedValue({ success: false, error: apiError });

      await expect(inputApi.sendKey(mockKey as any)).rejects.toThrow('Network timeout');
    });
  });
});
