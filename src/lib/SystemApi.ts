import type { getHttpDigestClient } from '../http-clients/http-digest-client';

interface SystemData {
  api_version: {
    Major: number;
    Minor: number;
    Patch: number;
  };
  [key: string]: unknown;
}

export class SystemApi {
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  async getSystem() {
    const res = await this.digestClient.request<SystemData>('system');

    if (!res.success) {
      return res;
    }

    return {
      success: true,
      data: {
        ...res.data,
        fullApiVersion: `${res.data.api_version.Major}.${res.data.api_version.Minor}.${res.data.api_version.Patch}`,
      },
    };
  }

  getCurrentActivity() {
    return this.digestClient.request('activities/current');
  }

  getApplications() {
    return this.digestClient.request('applications');
  }
}
