import { ambilightBrightnessChoicesSchema } from '../../../schemas/jointspace.schema';
import type { AmbilightBrightnessChoices, MenuSettingValueInner } from '../../../types';
import type { AmbilightApi } from '../AmbilightApi';
import type { MenuApi } from '../MenuApi';

export function handleAmbilightBrightness(ambilightInstance: AmbilightApi) {
  async function increase(): Promise<void> {
    const current = await ambilightInstance.getBrightnessValue();
    const realBrightness = Math.min(10, current + 1) as AmbilightBrightnessChoices;

    await ambilightInstance.setBrightness(realBrightness);
  }

  async function decrease(): Promise<void> {
    const current = await ambilightInstance.getBrightnessValue();
    const realBrightness = Math.max(0, current - 1) as AmbilightBrightnessChoices;

    await ambilightInstance.setBrightness(realBrightness);
  }

  async function getBrightnessValue(): Promise<number> {
    const infoRes = await ambilightInstance.getBrightnessInformation();

    return Number(infoRes.data?.value ?? 0);
  }

  async function getBrightnessInformation(menuInstance: MenuApi): Promise<MenuSettingValueInner> {
    const itemRes = await menuInstance.getMenuStructureItem('ambilight_brightness');

    const valuesRes = await menuInstance.getCurrentSetting(itemRes.node_id);

    return valuesRes[0]?.value;
  }

  async function setBrightness(menuInstance: MenuApi, brightness: AmbilightBrightnessChoices): Promise<void> {
    const _brightness = ambilightBrightnessChoicesSchema.parse(brightness);
    const flatNode = await menuInstance.getMenuStructureItem('ambilight_brightness');

    return menuInstance.setMenuItemSetting(flatNode, Number(_brightness));
  }

  return {
    increase,
    decrease,
    getBrightnessValue,
    getBrightnessInformation,
    setBrightness,
  };
}
