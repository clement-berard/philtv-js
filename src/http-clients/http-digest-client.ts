import { HttpClient, type RequestOptions } from 'urllib';

/** @internal */
export type ApiResult<T = unknown> = { success: true; data: T } | { success: false; error: Error };

type GetHttpDigestClient = {
  user: string;
  password: string;
  baseUrl: string;
  options?: {
    rejectUnauthorized?: boolean;
  };
};

export async function handleRequest<T = unknown>(
  url: string,
  baseUrl: string,
  client: HttpClient,
  reqOptions: RequestOptions = {},
): Promise<ApiResult<T>> {
  try {
    const fullUrl = `${baseUrl}/${url}`;

    const resp = await client.request(fullUrl, {
      ...reqOptions,
    });

    const ok = resp.status >= 200 && resp.status < 300;

    if (!ok) {
      return {
        success: false,
        error: new Error(`Request failed with status ${resp.status} (${resp.url})`),
      };
    }

    const rawData = resp.data.toString();

    try {
      return { success: true, data: JSON.parse(rawData) as T };
    } catch {
      return { success: true, data: rawData as unknown as T };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export function getHttpDigestClient(config: GetHttpDigestClient) {
  const client = new HttpClient({
    connect: {
      rejectUnauthorized: config?.options?.rejectUnauthorized ?? false,
      timeout: 1000,
    },
    defaultArgs: {
      digestAuth: `${config.user}:${config.password}`,
      contentType: 'json',
      headers: {},
    },
  });

  return {
    client,
    request: <T = unknown>(url: string, reqOptions: RequestOptions = {}) =>
      handleRequest<T>(url, config.baseUrl, client, reqOptions),
  };
}

export function getHttpClient() {
  return new HttpClient({
    connect: {
      rejectUnauthorized: false,
      timeout: 1000,
    },
    defaultArgs: {
      contentType: 'json',
    },
  });
}
