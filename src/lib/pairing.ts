import { randomBytes } from 'node:crypto';
import ky, { type KyInstance } from 'ky';
import { JS_SECRET_KEY } from '../constants';
import { createKyDigestClient, createKyJointSpaceClient } from '../http-clients';
import type { CompletePairingResponse, HttpClients, PhilTVPairingParams } from '../types';
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
  private apiUrls: { unsecure: string; secure: string };
  private deviceInformation!: ReturnType<typeof getDeviceObject>;
  private httpClients!: HttpClients;
  private startPairingResponse!: { authKey: any; authTimestamp: any; timeout: any };
  private credentials!: { password: any; user: string | undefined };
  private apiVersion!: number;

  constructor(initParams: PhilTVPairingParams) {
    this.tvBase = initParams;
    this.apiUrls = {
      secure: `https://${this.tvBase.tvIp}:${this.tvBase.apiPort}`,
      unsecure: `http://${this.tvBase.tvIp}:${this.tvBase.apiPort}`,
    };
  }

  async init() {
    const { apiVersion, isReady } = await getInformationSystem(
      ky.create({
        prefixUrl: this.apiUrls.secure,
      }),
    );

    if (!isReady) {
      throw new Error('TV is not ready for pairing');
    }

    this.deviceId = randomBytes(16).toString('hex');
    this.deviceInformation = getDeviceObject(this.deviceId);
    this.apiVersion = apiVersion;
    this.httpClients = {
      secure: createKyJointSpaceClient().extend({
        prefixUrl: `${this.apiUrls.secure}/${apiVersion}`,
      }),
      unsecure: createKyJointSpaceClient().extend({
        prefixUrl: `${this.apiUrls.unsecure}/${apiVersion}`,
      }),
      digest: undefined,
    };
  }

  async startPairing() {
    const res = await this.httpClients?.secure
      .post('pair/request', {
        json: { device: this.deviceInformation, scope: ['read', 'write', 'control'] },
      })
      .json();

    const { timestamp: authTimestamp, auth_key: authKey, timeout, isSuccess } = res as any;

    if (!isSuccess) {
      throw new Error('Failed to start pairing');
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

    const promptForPin = async () => await promptText('Enter pin code?');

    return {
      promptForPin,
    };
  }

  async completePairing(pin: string): Promise<CompletePairingResponse> {
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

      const res = await this.httpClients.digest?.post('pair/grant', {
        json: authData,
        timeout: false,
        retry: 0,
        throwHttpErrors: false,
      });

      const response = (await res?.json()) as any;

      if (!response?.isSuccess) {
        return {
          config: undefined,
          error: {
            message: `Failed to complete pairing: ${response?.error_text}`,
          },
        };
      }

      const config = {
        user: this.credentials.user as string,
        password: this.credentials.password,
        apiUrl: this.apiUrls.secure,
        apiVersion: this.apiVersion,
        fullApiUrl: `${this.apiUrls.secure}/${this.apiVersion}`,
      };

      return {
        config,
        error: undefined,
      };
    }

    return {
      config: undefined,
      error: {
        message: 'Failed to complete pairing',
      },
    };
  }
}
