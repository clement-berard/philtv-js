import DigestClient from 'digest-fetch';
import ky from 'ky';

export function createKyDigestClient(baseURL: string, username: string, password: string) {
  const digestClient = new DigestClient(username, password);

  return ky.create({
    throwHttpErrors: true,
    prefixUrl: baseURL,
    hooks: {
      beforeRequest: [
        async (request) => {
          const authResponse = await digestClient.fetch(request.url, {
            method: request.method,
            headers: request.headers,
          });

          const authorizationHeader = authResponse.headers.get('authorization');
          if (authorizationHeader) {
            request.headers.set('authorization', authorizationHeader);
          }
        },
      ],
    },
  });
}
