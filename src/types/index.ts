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
