import { randomBytes } from 'node:crypto';
import { consola } from 'consola';
import ky, { type KyInstance } from 'ky';
import { tryit } from 'radash';
import { JS_SECRET_KEY } from '../constants';
import { createKyDigestClient, createKyJointSpaceClient } from '../http-clients';
import type { HttpClients, PhilTVPairingParams } from '../types';
import { createSignature, getDeviceObject, promptText } from '../utils';

export async function getInformationSystem(httpClient: KyInstance) {
  const res = await httpClient.get('system').json();
  const {
    api_version: { Major: apiVersion },
    featuring: { systemfeatures: systemFeatures },
  } = res as Record<string, any>;
  const isSecureTransport = systemFeatures.secured_transport === 'true';
  const isGoodPairingType = systemFeatures.pairing_type === 'digest_auth_pairing';
  const isReady = isSecureTransport && isGoodPairingType;
  return {
    apiVersion,
    systemFeatures,
    isSecureTransport,
    isGoodPairingType,
    isReady,
  };
}

export class PhilTVPairing {
  private tvBase: PhilTVPairingParams;
  private deviceId!: string;
  private apiUrls: { secure: string };
  private deviceInformation!: ReturnType<typeof getDeviceObject>;
  private httpClients!: HttpClients;
  private startPairingResponse!: { authKey: any; authTimestamp: any; timeout: any };
  private credentials!: { password: any; user: string | undefined };
  private apiVersion!: number;

  constructor(initParams: PhilTVPairingParams) {
    this.tvBase = initParams;
    this.apiUrls = {
      secure: `https://${this.tvBase.tvIp}:${this.tvBase.apiPort}`,
    };
    this.deviceId = randomBytes(16).toString('hex');
    this.deviceInformation = getDeviceObject(this.deviceId);
  }

  private async init() {
    const [errGetInfoSystem, dataInfoSystem] = await tryit(getInformationSystem)(
      ky.create({
        prefixUrl: this.apiUrls.secure,
      }),
    );

    if (errGetInfoSystem) {
      consola.error(`
      ${errGetInfoSystem.message}\n
      ${errGetInfoSystem.cause}\n
      Check if the TV is on and the IP is correct.
      Only Philips TVs with API version 6 or higher are supported.
      Only secure transport and digest auth pairing are supported (https).\n
      Bye.
      `);
      process.exit(1);
    }

    const { apiVersion, isReady } = dataInfoSystem;

    this.apiVersion = apiVersion;
    this.httpClients = {
      secure: createKyJointSpaceClient().extend({
        prefixUrl: `${this.apiUrls.secure}/${apiVersion}`,
      }),
      digest: undefined,
    };
  }

  async startPairing() {
    await this.init();
    const res = await this.httpClients?.secure
      .post('pair/request', {
        json: { device: this.deviceInformation, scope: ['read', 'write', 'control'] },
      })
      .json();

    const { timestamp: authTimestamp, auth_key: authKey, timeout, error_id, error_text } = res as any;

    if (error_id !== 'SUCCESS') {
      consola.error(`
      Failed to start pairing.\n
      ${error_text}\n
      Bye.
      `);
      process.exit(1);
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

    this.httpClients.digest = createKyDigestClient(
      `${this.apiUrls.secure}/${this.apiVersion}`,
      this.credentials.user as string,
      this.credentials.password,
    );

    const promptForPin = async () =>
      await consola.prompt('Enter pin code from TV:', {
        type: 'text',
      });

    return {
      promptForPin,
    };
  }

  async completePairing(pin: string) {
    consola.start('Completing pairing...');

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

      const [errorGrant, dataGrant] = await tryit(this.httpClients.digest?.post as KyInstance['post'])('pair/grant', {
        json: authData,
        timeout: false,
        retry: 0,
      });

      if (errorGrant) {
        return [errorGrant, undefined] as const;
      }

      const response = (await dataGrant?.json()) as any;

      if (response?.error_id !== 'SUCCESS') {
        return [new Error(`Failed to complete pairing: ${response?.error_text}`), undefined] as const;
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
