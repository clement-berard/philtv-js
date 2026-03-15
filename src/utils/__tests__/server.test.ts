import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createSignature } from '../server';

describe('server utils', () => {
  describe('createSignature', () => {
    it('should create a valid base64 signature', () => {
      const secretKey = Buffer.from('test-secret-key');
      const secret = 'test-timestamp';

      const expectedHmac = crypto.createHmac('sha1', secretKey).update(secret).digest('base64');
      const result = createSignature(secretKey, secret);

      expect(result).toBe(expectedHmac);
    });

    it('should return different signatures for different secrets', () => {
      const secretKey = Buffer.from('test-secret-key');

      const sig1 = createSignature(secretKey, 'secret1');
      const sig2 = createSignature(secretKey, 'secret2');

      expect(sig1).not.toBe(sig2);
    });
  });
});
