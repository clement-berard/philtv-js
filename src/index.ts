// Exportés UNIQUEMENT comme types.
// Impossible de faire "new AmbilightApi()" pour l'utilisateur,
// mais TypeDoc va générer les pages pour décrire leurs méthodes !
export type { AmbilightApi } from './lib/AmbilightApi';
export type { InputApi } from './lib/InputApi';
export type { MenuApi } from './lib/MenuApi';
export { PhilTVApi } from './lib/PhilTVApi';
export { PhilTVPairing } from './lib/PhilTVPairing';
export type { SystemApi } from './lib/SystemApi';
export type * from './types';
