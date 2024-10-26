import DigestClient from 'digest-fetch';
import ky from 'ky';

export function createKyJointSpaceClient() {
  return ky.create({
    throwHttpErrors: false,
    // hooks: {
    //   afterResponse: [
    //     async (_request, _options, response) => {
    //       const clonedResponse = response.clone();
    //       let responseBody = {} as Record<any, any>;
    //       try {
    //         responseBody = await clonedResponse.json();
    //       } catch (error) {}
    //
    //       const newBody = JSON.stringify({
    //         ...responseBody,
    //         ...(responseBody?.error_id && { isSuccess: responseBody?.error_id === 'SUCCESS' }),
    //       });
    //
    //       return new Response(newBody, {});
    //     },
    //   ],
    // },
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
