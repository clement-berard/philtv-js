import DigestClient from 'digest-fetch';
import ky from 'ky';

export function createKyJointSpaceClient() {
  return ky.create({
    throwHttpErrors: false,
  });
}

export function createKyDigestClient(baseURL: string, username: string, password: string) {
  const digestClient = new DigestClient(username, password);

  return createKyJointSpaceClient().extend({
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
