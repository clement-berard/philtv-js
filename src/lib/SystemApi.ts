import type { getHttpDigestClient } from '../http-clients/http-digest-client';

interface SystemData {
  api_version: {
    Major: number;
    Minor: number;
    Patch: number;
  };
  [key: string]: unknown;
}

/**
 * Provides methods to retrieve system-level information,
 * such as the API version, current activity, and available applications.
 */
export class SystemApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Retrieves system information, including a pre-formatted `fullApiVersion` string.
   *
   * @returns A result object containing the system data with an additional
   * `fullApiVersion` field formatted as `"Major.Minor.Patch"`.
   */
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

  /**
   * Retrieves the currently active activity.
   *
   * @returns A result object containing the current activity data.
   */
  getCurrentActivity() {
    return this.digestClient.request('activities/current');
  }

  /**
   * Retrieves the list of available applications.
   *
   * @returns A result object containing the applications data.
   */
  getApplications() {
    return this.digestClient.request('applications');
  }
}
