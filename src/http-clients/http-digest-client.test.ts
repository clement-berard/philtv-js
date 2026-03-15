import { HttpClient } from 'urllib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHttpClient, getHttpDigestClient, handleRequest } from './http-digest-client';

vi.mock('urllib');

describe('http-digest-client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('handleRequest', () => {
    let mockClient: any;

    beforeEach(() => {
      mockClient = {
        request: vi.fn(),
      };
    });

    it('should return JSON parsed data on successful response', async () => {
      mockClient.request.mockResolvedValue({
        status: 200,
        data: Buffer.from(JSON.stringify({ key: 'value' })),
        url: 'https://test.com/api/test',
      });

      const result = await handleRequest('test', 'https://test.com/api', mockClient);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: 'value' });
      }
      expect(mockClient.request).toHaveBeenCalledWith('https://test.com/api/test', {});
    });

    it('should return raw string data if JSON parsing fails', async () => {
      mockClient.request.mockResolvedValue({
        status: 200,
        data: Buffer.from('Plain text response'),
        url: 'https://test.com/api/test',
      });

      const result = await handleRequest('test', 'https://test.com/api', mockClient);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Plain text response');
      }
    });

    it('should return error if status is not 2xx', async () => {
      mockClient.request.mockResolvedValue({
        status: 404,
        url: 'https://test.com/api/test',
      });

      const result = await handleRequest('test', 'https://test.com/api', mockClient);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Request failed with status 404 (https://test.com/api/test)');
      }
    });

    it('should return error if request throws an exception', async () => {
      mockClient.request.mockRejectedValue(new Error('Network timeout'));

      const result = await handleRequest('test', 'https://test.com/api', mockClient);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Network timeout');
      }
    });

    it('should return stringified error if exception is not an Error instance', async () => {
      mockClient.request.mockRejectedValue('String error');

      const result = await handleRequest('test', 'https://test.com/api', mockClient);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('String error');
      }
    });
  });

  describe('getHttpDigestClient', () => {
    it('should initialize HttpClient with correct config and digestAuth', () => {
      const config = {
        user: 'test_user',
        password: 'test_password',
        baseUrl: 'https://test.com',
      };

      const result = getHttpDigestClient(config);

      expect(HttpClient).toHaveBeenCalledWith({
        connect: {
          rejectUnauthorized: false,
          timeout: 1000,
        },
        defaultArgs: {
          digestAuth: 'test_user:test_password',
          contentType: 'json',
          headers: {},
        },
      });

      expect(result.client).toBeDefined();
      expect(typeof result.request).toBe('function');
    });

    it('should initialize HttpClient with rejectUnauthorized true when specified', () => {
      const config = {
        user: 'test_user',
        password: 'test_password',
        baseUrl: 'https://test.com',
        options: {
          rejectUnauthorized: true,
        },
      };

      getHttpDigestClient(config);

      expect(HttpClient).toHaveBeenCalledWith(
        expect.objectContaining({
          connect: expect.objectContaining({
            rejectUnauthorized: true,
          }),
        }),
      );
    });
  });

  describe('getHttpClient', () => {
    it('should initialize basic HttpClient', () => {
      getHttpClient();

      expect(HttpClient).toHaveBeenCalledWith({
        connect: {
          rejectUnauthorized: false,
          timeout: 1000,
        },
        defaultArgs: {
          contentType: 'json',
        },
      });
    });
  });
});
