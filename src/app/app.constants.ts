/**
 * Constantes partagées par au moins deux fichiers.
 * Une constante utilisée par un seul fichier reste dans ce fichier.
 */
export const MESSAGES = {
  loadError: 'Olympic data could not be loaded.',
  noData: 'No data available',
  unknownCountry: 'This country does not exist.',
} as const;

export const COUNTRY_ROUTE_SEGMENT = 'country';
