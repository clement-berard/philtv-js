import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as httpClientModule from '../../http-clients/http-digest-client';
import * as deviceUtilsModule from '../../utils/device.utils';
import * as serverUtilsModule from '../../utils/server';
import { getInformationSystem, PhilTVPairing } from './PhilTVPairing';

vi.mock('../../http-clients/http-digest-client');
vi.mock('../../utils/server');
vi.mock('../../utils/device.utils');

describe('PhilTVPairing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInformationSystem', () => {
    it('should return system information when request succeeds', async () => {
      const mockRequest = vi.fn().mockResolvedValue({
        data: {
          api_version: { Major: 6 },
          featuring: {
            systemfeatures: {
              secured_transport: 'true',
              pairing_type: 'digest_auth_pairing',
            },
          },
        },
      });
      vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);

      const result = await getInformationSystem('https://192.168.1.10:1926');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          apiVersion: 6,
          systemFeatures: {
            secured_transport: 'true',
            pairing_type: 'digest_auth_pairing',
          },
          isSecureTransport: true,
          isGoodPairingType: true,
          isReady: true,
        });
      }
    });

    it('should return error when request fails', async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);

      const result = await getInformationSystem('https://192.168.1.10:1926');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network error');
      }
    });
  });

  describe('PhilTVPairing class', () => {
    let pairing: PhilTVPairing;

    beforeEach(() => {
      vi.spyOn(deviceUtilsModule, 'getDeviceObject').mockReturnValue({ os: 'TestOS' } as any);
      pairing = new PhilTVPairing({ tvIp: '192.168.1.10' });
    });

    describe('constructor', () => {
      it('should initialize with correct default URLs and random deviceId', () => {
        expect(pairing.apiUrls.secure).toBe('https://192.168.1.10:1926');
        expect(pairing.deviceId).toBeDefined();
        expect(pairing.deviceInformation).toEqual({ os: 'TestOS' });
      });

      it('should initialize with custom port', () => {
        const customPairing = new PhilTVPairing({ tvIp: '192.168.1.10', apiPort: 1927 });
        expect(customPairing.apiUrls.secure).toBe('https://192.168.1.10:1927');
      });
    });

    describe('init', () => {
      it('should return success when TV is ready', async () => {
        const mockRequest = vi.fn().mockResolvedValue({
          data: {
            api_version: { Major: 6 },
            featuring: {
              systemfeatures: {
                secured_transport: 'true',
                pairing_type: 'digest_auth_pairing',
              },
            },
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);

        const result = await pairing.init();

        expect(result.success).toBe(true);
        expect(pairing.pairingRequestUrl).toBe('https://192.168.1.10:1926/6/pair/request');
      });

      it('should return error when TV is not ready', async () => {
        const mockRequest = vi.fn().mockResolvedValue({
          data: {
            api_version: { Major: 6 },
            featuring: {
              systemfeatures: {
                secured_transport: 'false',
                pairing_type: 'digest_auth_pairing',
              },
            },
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);

        const result = await pairing.init();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBe('TV is not ready');
        }
      });
    });

    describe('startPairing', () => {
      beforeEach(async () => {
        const mockRequest = vi.fn().mockResolvedValue({
          data: {
            api_version: { Major: 6 },
            featuring: {
              systemfeatures: {
                secured_transport: 'true',
                pairing_type: 'digest_auth_pairing',
              },
            },
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);
        await pairing.init();
      });

      it('should start pairing successfully', async () => {
        const mockRequest = vi.fn().mockResolvedValue({
          data: {
            error_id: 'SUCCESS',
            timestamp: 1234567890,
            auth_key: 'test_auth_key',
            timeout: 60,
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);
        vi.spyOn(httpClientModule, 'getHttpDigestClient').mockReturnValue({} as any);

        const result = await pairing.startPairing();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            authTimestamp: 1234567890,
            authKey: 'test_auth_key',
            timeout: 60,
          });
        }
      });

      it('should handle API error response during startPairing', async () => {
        const mockRequest = vi.fn().mockResolvedValue({
          data: {
            error_id: 'FAILED',
            error_text: 'Device not allowed',
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: mockRequest } as any);

        const result = await pairing.startPairing();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBe('Failed to start pairing: Device not allowed');
        }
      });
    });

    describe('completePairing', () => {
      beforeEach(async () => {
        const initRequest = vi.fn().mockResolvedValue({
          data: {
            api_version: { Major: 6 },
            featuring: {
              systemfeatures: {
                secured_transport: 'true',
                pairing_type: 'digest_auth_pairing',
              },
            },
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: initRequest } as any);
        await pairing.init();

        const startRequest = vi.fn().mockResolvedValue({
          data: {
            error_id: 'SUCCESS',
            timestamp: 1234567890,
            auth_key: 'test_auth_key',
            timeout: 60,
          },
        });
        vi.spyOn(httpClientModule, 'getHttpClient').mockReturnValue({ request: startRequest } as any);

        const mockDigestClient = {
          request: vi.fn().mockResolvedValue({
            success: true,
            data: { error_id: 'SUCCESS' },
          }),
        };
        vi.spyOn(httpClientModule, 'getHttpDigestClient').mockReturnValue(mockDigestClient as any);

        await pairing.startPairing();
      });

      it('should fail if PIN is empty', async () => {
        const result = await pairing.completePairing('');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBe('Failed to complete pairing');
        }
      });

      it('should successfully complete pairing', async () => {
        vi.spyOn(serverUtilsModule, 'createSignature').mockReturnValue('mocked_signature');

        const result = await pairing.completePairing('1234');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            user: pairing.deviceId,
            password: 'test_auth_key',
            apiUrl: 'https://192.168.1.10:1926',
            apiVersion: 6,
            fullApiUrl: 'https://192.168.1.10:1926/6',
          });
        }
      });

      it('should handle grant failure response', async () => {
        vi.spyOn(serverUtilsModule, 'createSignature').mockReturnValue('mocked_signature');

        const mockDigestClient = {
          request: vi.fn().mockResolvedValue({
            success: true,
            data: { error_id: 'INVALID_PIN', error_text: 'Wrong PIN code' },
          }),
        };
        (pairing as any).httpClients = { digest: mockDigestClient };

        const result = await pairing.completePairing('0000');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBe('Failed to complete pairing: Wrong PIN code');
        }
      });
    });
  });
});
