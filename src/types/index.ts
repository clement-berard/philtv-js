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
};

export type FlatNode = {
  node_id: number;
  type: string;
  string_id?: string;
  context?: string;
  data?: unknown;
};

export type * from './jointspace';
