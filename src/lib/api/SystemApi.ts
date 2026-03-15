import type { getHttpDigestClient } from '../../http-clients/http-digest-client';
import type { ApplicationList, CurrentActivity, SystemInfo, SystemInfoEnriched } from '../../types';

/**
 * Provides methods to interact with the System API,
 * including device information, current activity, and application listing.
 */
export class SystemApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Retrieves system information from the device.
   * @returns A {@link SystemInfoEnriched} object extending the raw system info with a formatted `fullApiVersion` string (e.g. `"6.2.0"`).
   * @throws If the request fails.
   */
  async getSystem(): Promise<SystemInfoEnriched> {
    const res = await this.digestClient.request<SystemInfo>('system');

    if (!res.success) {
      throw res.error;
    }

    return {
      ...res.data,
      fullApiVersion: `${res.data.api_version.Major}.${res.data.api_version.Minor}.${res.data.api_version.Patch}`,
    };
  }

  /**
   * Retrieves the current activity running on the device (e.g. active app or source).
   * @throws If the request fails.
   */
  async getCurrentActivity(): Promise<CurrentActivity> {
    const res = await this.digestClient.request<CurrentActivity>('activities/current');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }

  /**
   * Retrieves the list of installed applications on the device.
   * @throws If the request fails.
   */
  async getApplications(): Promise<ApplicationList> {
    const res = await this.digestClient.request<ApplicationList>('applications');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }
}
