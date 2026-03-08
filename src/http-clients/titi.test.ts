import { HttpClient } from 'urllib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHttpClient, getHttpDigestClient, handleRequest } from './index';

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}));

vi.mock('urllib', () => {
  const HttpClient = vi.fn(function (this: any) {
    this.request = mockRequest;
  });
  return { HttpClient };
});

describe('handleRequest', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('returns parsed JSON data on 2xx response', async () => {
    const payload = { foo: 'bar' };
    mockRequest.mockResolvedValue({
      status: 200,
      url: 'http://tv/api/test',
      data: Buffer.from(JSON.stringify(payload)),
    });

    const client = new HttpClient();
    const [err, data, resp] = await handleRequest('api/test', 'http://tv', client);

    expect(err).toBeUndefined();
    expect(data).toEqual(payload);
    expect(resp?.status).toBe(200);
  });

  it('returns raw string when response body is not valid JSON', async () => {
    mockRequest.mockResolvedValue({
      status: 200,
      url: 'http://tv/api/test',
      data: Buffer.from('not-json'),
    });

    const client = new HttpClient();
    const [err, data] = await handleRequest('api/test', 'http://tv', client);

    expect(err).toBeUndefined();
    expect(data).toBe('not-json');
  });

  it('returns error when status is not 2xx', async () => {
    mockRequest.mockResolvedValue({
      status: 401,
      url: 'http://tv/api/test',
      data: Buffer.from(''),
    });

    const client = new HttpClient();
    const [err, data, resp] = await handleRequest('api/test', 'http://tv', client);

    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toContain('401');
    expect(data).toBeUndefined();
    expect(resp?.status).toBe(401);
  });

  it('returns error when request throws', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'));

    const client = new HttpClient();
    const [err, data, resp] = await handleRequest('api/test', 'http://tv', client);

    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Network error');
    expect(data).toBeUndefined();
    expect(resp).toBeUndefined();
  });

  it('builds the correct full URL', async () => {
    mockRequest.mockResolvedValue({
      status: 200,
      url: 'http://tv/api/status',
      data: Buffer.from('{}'),
    });

    const client = new HttpClient();
    await handleRequest('api/status', 'http://tv', client);

    expect(mockRequest).toHaveBeenCalledWith('http://tv/api/status', {});
  });

  it('forwards reqOptions to the client', async () => {
    mockRequest.mockResolvedValue({
      status: 200,
      url: 'http://tv/api/test',
      data: Buffer.from('{}'),
    });

    const client = new HttpClient();
    await handleRequest('api/test', 'http://tv', client, { method: 'POST' });

    expect(mockRequest).toHaveBeenCalledWith('http://tv/api/test', { method: 'POST' });
  });
});

describe('getHttpDigestClient', () => {
  it('returns a client and a request function', () => {
    const result = getHttpDigestClient({ user: 'admin', password: 'secret', baseUrl: 'https://tv' });

    expect(result.client).toBeDefined();
    expect(typeof result.request).toBe('function');
  });

  it('instantiates HttpClient with digestAuth', () => {
    getHttpDigestClient({ user: 'admin', password: 'secret', baseUrl: 'https://tv' });

    expect(HttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultArgs: expect.objectContaining({
          digestAuth: 'admin:secret',
        }),
      }),
    );
  });

  it('uses rejectUnauthorized from options when provided', () => {
    getHttpDigestClient({ user: 'u', password: 'p', baseUrl: 'https://tv', options: { rejectUnauthorized: true } });

    expect(HttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        connect: expect.objectContaining({ rejectUnauthorized: true }),
      }),
    );
  });

  it('defaults rejectUnauthorized to false', () => {
    getHttpDigestClient({ user: 'u', password: 'p', baseUrl: 'https://tv' });

    expect(HttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        connect: expect.objectContaining({ rejectUnauthorized: false }),
      }),
    );
  });
});

describe('getHttpClient', () => {
  it('returns an HttpClient instance', () => {
    const client = getHttpClient();
    expect(client).toBeDefined();
  });

  it('instantiates HttpClient with rejectUnauthorized false and json contentType', () => {
    getHttpClient();

    expect(HttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        connect: expect.objectContaining({ rejectUnauthorized: false }),
        defaultArgs: expect.objectContaining({ contentType: 'json' }),
      }),
    );
  });
});
