import { tryit } from 'radash';
import { HttpClient, type RequestOptions } from 'urllib';

type GetHttpDigestClient = {
  user: string;
  password: string;
  baseUrl: string;
  options?: {
    rejectUnauthorized?: boolean;
  };
};

export async function handleRequest(url: string, baseUrl: string, client: HttpClient, reqOptions: RequestOptions = {}) {
  const fullUrl = `${baseUrl}/${url}`;

  try {
    const resp = await client.request(fullUrl, {
      ...reqOptions,
    });

    const ok = resp.status >= 200 && resp.status < 300;

    if (!ok) {
      return [new Error(`Request failed with status ${resp.status} (${resp.url})`), undefined, resp] as const;
    }

    const [errJsonParse, triedJson] = await tryit(JSON.parse)(resp.data.toString());
    const realData = !errJsonParse ? triedJson : resp.data.toString();

    return [undefined, realData, { ok, ...resp, data: realData }] as const;
  } catch (error: unknown) {
    return [error as Error, undefined, undefined] as const;
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
    },
  });

  return {
    client,
    request: (url: string, reqOptions: RequestOptions = {}) => handleRequest(url, config.baseUrl, client, reqOptions),
  };
}

export function getHttpClient() {
  return new HttpClient({
    connect: {
      rejectUnauthorized: false,
    },
    defaultArgs: {
      contentType: 'json',
    },
  });
}
