import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import type { ApplicationList, CurrentActivity, SystemInfo, SystemInfoEnriched } from '../types';

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
  async getSystem(): Promise<ApiResult<SystemInfoEnriched>> {
    const res = await this.digestClient.request<SystemInfo>('system');

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
  getCurrentActivity(): Promise<ApiResult<CurrentActivity>> {
    return this.digestClient.request('activities/current');
  }

  /**
   * Retrieves the list of available applications.
   *
   * @returns A result object containing the applications' data.
   */
  getApplications(): Promise<ApiResult<ApplicationList>> {
    return this.digestClient.request('applications');
  }
}
