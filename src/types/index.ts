import type { KyInstance } from 'ky';

export type PhilTVPairingParams = {
  tvIp: string;
  apiPort: number;
};

/**
 * Parameters required to initialize the `PhilTVApiBase` class.
 *
 * This object includes the API connection details and optional configuration settings.
 */
export type PhilTVApiParams = {
  /**
   * The URL of the Philips TV API to connect to.
   * Include the protocol, IP address, port number and API version.
   * @example https://192.168.0.22:1926/6
   */
  apiUrl: string;

  /**
   * The username for authentication with the API.
   */
  user: string;

  /**
   * The password for authentication with the API.
   */
  password: string;

  /**
   * Optional parameters for API configuration.
   */
  options?: {
    /**
     * Indicates whether to cache the menu structure locally.
     * If set to `true`, the retrieved menu structure will be stored in a file using the [unstorage](https://unstorage.unjs.io/) library.
     * On subsequent requests, the cached version will be checked before making a network call, which can improve performance by
     * reducing unnecessary API requests. If not required, this option can be omitted or set to `false`.
     */
    cacheStructure?: boolean;
  };
};

export type HttpClients = {
  secure: KyInstance;
  digest?: KyInstance;
};

export type FlatNode = {
  node_id: number;
  type: string;
  string_id?: string;
  context?: string;
  data?: any;
};
