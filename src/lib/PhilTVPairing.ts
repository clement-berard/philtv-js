import { randomBytes } from 'node:crypto';
import { JS_SECRET_KEY } from '../constants';
import { getHttpClient, getHttpDigestClient } from '../http-clients';
import { getDeviceObject } from '../utils';
import { createSignature } from '../utils/server';

export async function getInformationSystem(apiUrl: string) {
  const client = getHttpClient();
  try {
    const { data: res } = await client.request(`${apiUrl}/system`, {
      dataType: 'json',
      timeout: 2000,
      signal: AbortSignal.timeout(2000),
    });
    const {
      api_version: { Major: apiVersion },
      featuring: { systemfeatures: systemFeatures },
    } = res as Record<string, any>;
    const isSecureTransport = systemFeatures.secured_transport === 'true';
    const isGoodPairingType = systemFeatures.pairing_type === 'digest_auth_pairing';
    const isReady = isSecureTransport && isGoodPairingType;
    return [
      undefined,
      {
        apiVersion,
        systemFeatures,
        isSecureTransport,
        isGoodPairingType,
        isReady,
      },
    ] as const;
  } catch (e) {
    return [e as Error, undefined] as const;
  }
}

export type PhilTVPairingParams = {
  /**
   * The IP address of the Philips TV to connect to.
   * Without the protocol and port number.
   * @example 192.168.1.2
   */
  tvIp: string;
  /**
   * The port number of the Philips TV API to connect to.
   * Default is `1926`.
   */
  apiPort?: number;
};

export class PhilTVPairing {
  private tvBase: PhilTVPairingParams;
  readonly deviceId!: string;
  readonly apiUrls: { secure: string };
  readonly deviceInformation!: ReturnType<typeof getDeviceObject>;
  private httpClients!: { digest?: ReturnType<typeof getHttpDigestClient> };
  private startPairingResponse!: { authKey: any; authTimestamp: any; timeout: any };
  private credentials!: { password: any; user: string | undefined };
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

  async init() {
    const [errGetSystem, dataInfoSystem] = await getInformationSystem(this.apiUrls.secure);

    if (!errGetSystem) {
      this.apiVersion = dataInfoSystem?.apiVersion;
      this.pairingRequestUrl = `${this.apiUrls.secure}/${this.apiVersion}/pair/request`;
    }

    return [errGetSystem, dataInfoSystem] as const;
  }

  async startPairing() {
    const client = getHttpClient();
    const { data: res } = await client.request(this.pairingRequestUrl, {
      method: 'POST',
      data: {
        device: this.deviceInformation,
        scope: ['read', 'write', 'control'],
      },
      dataType: 'json',
    });

    const { timestamp: authTimestamp, auth_key: authKey, timeout, error_id, error_text } = res as any;

    if (error_id !== 'SUCCESS') {
      return [new Error(`Failed to start pairing: ${error_text}`), undefined] as const;
    }

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
        user: this.credentials.user as string,
        password: this.credentials.password,
        baseUrl: `${this.apiUrls.secure}/${this.apiVersion}`,
      }),
    };

    return [undefined, this.startPairingResponse] as const;
  }

  async completePairing(pin: string) {
    if (!pin) {
      return [new Error('Failed to complete pairing'), undefined] as const;
    }

    if (this.startPairingResponse) {
      const decodedSecretKey = Buffer.from(JS_SECRET_KEY, 'base64');
      const authTimestamp = this.startPairingResponse?.authTimestamp + pin;
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
        return [new Error('No digest client'), undefined] as const;
      }

      const [errorGrant, dataGrant] = await this.httpClients.digest.request('pair/grant', {
        method: 'POST',
        data: authData,
        retry: 0,
      });

      if (errorGrant) {
        return [errorGrant, undefined] as const;
      }

      if (dataGrant?.error_id !== 'SUCCESS') {
        return [new Error(`Failed to complete pairing: ${dataGrant?.error_text}`), undefined] as const;
      }

      const config = {
        user: this.credentials.user as string,
        password: this.credentials.password,
        apiUrl: this.apiUrls.secure,
        apiVersion: this.apiVersion,
        fullApiUrl: `${this.apiUrls.secure}/${this.apiVersion}`,
      };

      return [undefined, config] as const;
    }

    return [new Error('Failed to complete pairing'), undefined] as const;
  }
}
