import { getHttpDigestClient } from '../../http-clients/http-digest-client';
import { philTVApiParamsSchemas } from '../../schemas/philtvApi.schema';
import type { PhilTVApiParams } from '../../types';
import { AmbilightApi } from './AmbilightApi';
import { InputApi } from './InputApi';
import { MenuApi } from './MenuApi';
import { SystemApi } from './SystemApi';

export class PhilTVApi {
  /** @internal */
  public readonly digestClient: ReturnType<typeof getHttpDigestClient>;
  public readonly menu: MenuApi;
  public readonly system: SystemApi;
  public readonly input: InputApi;
  public readonly ambilight: AmbilightApi;

  constructor(params: PhilTVApiParams) {
    const { user, apiUrl, password } = philTVApiParamsSchemas.parse(params);

    this.digestClient = getHttpDigestClient({
      user,
      password,
      baseUrl: apiUrl,
    });

    this.menu = new MenuApi(this.digestClient);
    this.system = new SystemApi(this.digestClient);
    this.input = new InputApi(this.digestClient);
    this.ambilight = new AmbilightApi(this.digestClient, this.menu);
  }
}
