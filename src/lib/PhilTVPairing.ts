import { randomBytes } from 'node:crypto';
import { JS_SECRET_KEY } from '../constants/app.constant';
import { type ApiResult, getHttpClient, getHttpDigestClient } from '../http-clients/http-digest-client';
import { getDeviceObject } from '../utils';
import { createSignature } from '../utils/server';

export interface SystemInformation {
  apiVersion: number;
  systemFeatures: Record<string, unknown>;
  isSecureTransport: boolean;
  isGoodPairingType: boolean;
  isReady: boolean;
}

export async function getInformationSystem(apiUrl: string): Promise<ApiResult<SystemInformation>> {
  const client = getHttpClient();
  try {
    const { data: res } = await client.request(`${apiUrl}/system`, {
      dataType: 'json',
      timeout: 2000,
      signal: AbortSignal.timeout(2000),
    });

    const response = res as Record<string, unknown>;
    const api_version = response.api_version as Record<string, unknown>;
    const apiVersion = api_version.Major as number;

    const featuring = response.featuring as Record<string, unknown>;
    const systemFeatures = featuring.systemfeatures as Record<string, unknown>;

    const isSecureTransport = systemFeatures.secured_transport === 'true';
    const isGoodPairingType = systemFeatures.pairing_type === 'digest_auth_pairing';
    const isReady = isSecureTransport && isGoodPairingType;

    return {
      success: true,
      data: {
        apiVersion,
        systemFeatures,
        isSecureTransport,
        isGoodPairingType,
        isReady,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export type PhilTVPairingParams = {
  tvIp: string;
  apiPort?: number;
};

export class PhilTVPairing {
  private tvBase: PhilTVPairingParams;
  public readonly deviceId: string;
  public readonly apiUrls: { secure: string };
  public readonly deviceInformation: ReturnType<typeof getDeviceObject>;
  private httpClients!: { digest?: ReturnType<typeof getHttpDigestClient> };
  private startPairingResponse!: { authKey: string; authTimestamp: number; timeout: number };
  private credentials!: { password: string; user: string };
  private apiVersion!: number;
  public pairingRequestUrl!: string;

  constructor(initParams: PhilTVPairingParams) {
    this.tvBase = initParams;
    this.apiUrls = {
      secure: `https://${this.tvBase.tvIp}:${this.tvBase.apiPort || 1926}`,
    };
    this.deviceId = randomBytes(16).toString('hex');
    this.deviceInformation = getDeviceObject(this.deviceId);
  }

  async init(): Promise<ApiResult<SystemInformation>> {
    const res = await getInformationSystem(this.apiUrls.secure);

    if (res.success) {
      this.apiVersion = res.data.apiVersion;
      this.pairingRequestUrl = `${this.apiUrls.secure}/${this.apiVersion}/pair/request`;
    }

    return res;
  }

  async startPairing(): Promise<ApiResult<Record<string, unknown>>> {
    try {
      const client = getHttpClient();
      const { data: res } = await client.request(this.pairingRequestUrl, {
        method: 'POST',
        data: {
          device: this.deviceInformation,
          scope: ['read', 'write', 'control'],
        },
        dataType: 'json',
      });

      const responseData = res as Record<string, unknown>;
      const error_id = responseData.error_id as string;
      const error_text = responseData.error_text as string;

      if (error_id !== 'SUCCESS') {
        return { success: false, error: new Error(`Failed to start pairing: ${error_text}`) };
      }

      const authTimestamp = responseData.timestamp as number;
      const authKey = responseData.auth_key as string;
      const timeout = responseData.timeout as number;

      this.startPairingResponse = {
        authTimestamp,
        authKey,
        timeout,
      };

      this.credentials = {
        user: this.deviceId,
        password: authKey,
      };

      this.httpClients = {
        digest: getHttpDigestClient({
          user: this.credentials.user,
          password: this.credentials.password,
          baseUrl: `${this.apiUrls.secure}/${this.apiVersion}`,
        }),
      };

      return { success: true, data: this.startPairingResponse as unknown as Record<string, unknown> };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  async completePairing(pin: string): Promise<ApiResult<Record<string, unknown>>> {
    if (!pin) {
      return { success: false, error: new Error('Failed to complete pairing') };
    }

    if (this.startPairingResponse) {
      const decodedSecretKey = Buffer.from(JS_SECRET_KEY, 'base64');
      const authTimestamp = this.startPairingResponse.authTimestamp.toString() + pin;
      const signature = createSignature(decodedSecretKey, authTimestamp);

      const authData = {
        device: this.deviceInformation,
        auth: {
          auth_AppId: '1',
          pin: pin,
          auth_timestamp: this.startPairingResponse.authTimestamp,
          auth_signature: signature,
        },
      };

      if (!this.httpClients.digest) {
        return { success: false, error: new Error('No digest client') };
      }

      const res = await this.httpClients.digest.request<Record<string, unknown>>('pair/grant', {
        method: 'POST',
        data: authData,
        retry: 0,
      });

      if (!res.success) {
        return res;
      }

      const dataGrant = res.data;

      if (dataGrant?.error_id !== 'SUCCESS') {
        return { success: false, error: new Error(`Failed to complete pairing: ${dataGrant?.error_text}`) };
      }

      const config = {
        user: this.credentials.user,
        password: this.credentials.password,
        apiUrl: this.apiUrls.secure,
        apiVersion: this.apiVersion,
        fullApiUrl: `${this.apiUrls.secure}/${this.apiVersion}`,
      };

      return { success: true, data: config };
    }

    return { success: false, error: new Error('Failed to complete pairing') };
  }
}
