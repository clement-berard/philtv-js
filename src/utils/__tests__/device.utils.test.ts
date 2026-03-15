import { describe, expect, it } from 'vitest';
import { getDeviceObject } from '../device.utils';

describe('device.utils', () => {
  describe('getDeviceObject', () => {
    it('should return the correct device object format for a given deviceId', () => {
      const result = getDeviceObject('test-device-123');

      expect(result).toEqual({
        app_id: 'gapp.id',
        id: 'test-device-123',
        device_name: 'MyName',
        device_os: 'Android',
        app_name: 'PhilTV-js APP',
        type: 'native',
      });
    });
  });
});
