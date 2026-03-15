import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SystemApi } from '../SystemApi';

describe('SystemApi', () => {
  let systemApi: SystemApi;
  let mockDigestClient: any;

  beforeEach(() => {
    mockDigestClient = {
      request: vi.fn(),
    };
    systemApi = new SystemApi(mockDigestClient);
  });

  describe('getSystem', () => {
    it('should return enriched system information on success', async () => {
      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: {
          name: 'Philips TV',
          api_version: { Major: 6, Minor: 2, Patch: 0 },
        },
      });

      const result = await systemApi.getSystem();

      expect(mockDigestClient.request).toHaveBeenCalledWith('system');
      expect(result).toEqual({
        name: 'Philips TV',
        api_version: { Major: 6, Minor: 2, Patch: 0 },
        fullApiVersion: '6.2.0',
      });
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Network error');
      mockDigestClient.request.mockResolvedValue({
        success: false,
        error,
      });

      await expect(systemApi.getSystem()).rejects.toThrow('Network error');
    });
  });

  describe('getCurrentActivity', () => {
    it('should return current activity on success', async () => {
      const mockActivity = { component: { packageName: 'org.droidtv.channels' } };
      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: mockActivity,
      });

      const result = await systemApi.getCurrentActivity();

      expect(mockDigestClient.request).toHaveBeenCalledWith('activities/current');
      expect(result).toEqual(mockActivity);
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Not found');
      mockDigestClient.request.mockResolvedValue({
        success: false,
        error,
      });

      await expect(systemApi.getCurrentActivity()).rejects.toThrow('Not found');
    });
  });

  describe('getApplications', () => {
    it('should return applications list on success', async () => {
      const mockApps = {
        applications: [{ id: 'app1' }, { id: 'app2' }],
      };
      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: mockApps,
      });

      const result = await systemApi.getApplications();

      expect(mockDigestClient.request).toHaveBeenCalledWith('applications');
      expect(result).toEqual(mockApps);
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Server error');
      mockDigestClient.request.mockResolvedValue({
        success: false,
        error,
      });

      await expect(systemApi.getApplications()).rejects.toThrow('Server error');
    });
  });
});
