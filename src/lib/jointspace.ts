import { createKyDigestClient, createKyJointSpaceClient } from '../http-clients';
import { HttpClients } from '../types';
import { getInformationSystem } from './pairing';

type PhilTVJointspaceParams = {
  apiUrl: string;
  user: string;
  password: string;
};

export class PhilTVJointspace {
  private httpClients!: HttpClients;
  constructor(params: PhilTVJointspaceParams) {
    this.httpClients = {
      secure: createKyJointSpaceClient().extend({
        prefixUrl: params.apiUrl,
      }),
      digest: createKyDigestClient(params.apiUrl, params.user, params.password),
    };
  }

  getInformationSystem() {
    return getInformationSystem(this.httpClients.secure);
  }

  getAmbilight() {
    return this.httpClients.digest?.get('ambilight/currentconfiguration').json();
  }

  async setAmbilightBrightness(level: number) {
    try {
      return this.httpClients.digest?.post(`ambilight/currentconfiguration`, {
        json: {
          values: [
            {
              value: {
                data: level, // placeholder for brightness level
              },
            },
          ],
        },
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  getNetworkDevices() {
    return this.httpClients.digest?.get('network/devices').json();
  }

  getPowerState() {
    return this.httpClients.digest?.get('powerstate').json();
  }
}
