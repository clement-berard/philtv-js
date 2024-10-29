import type { KyInstance } from 'ky';

export type PhilTVPairingParams = {
  tvIp: string;
  apiPort: number;
};

export type PhilTVApiParams = {
  apiUrl: string;
  user: string;
  password: string;
};

export type HttpClients = {
  unsecure?: KyInstance;
  secure: KyInstance;
  digest?: KyInstance;
};

export type CompletePairingResponse =
  | {
      error: {
        message: string;
      };
      config: undefined;
    }
  | {
      error: undefined;
      config: {
        user: string;
        password: string;
        apiUrl: string;
        apiVersion: number;
        fullApiUrl: string;
      };
    };

export type FlatNode = {
  node_id: number;
  type: string;
  string_id?: string;
  context?: string;
  data?: any;
};
