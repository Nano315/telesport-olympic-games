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

/** Palette des graphiques. Reprise de la maquette, réutilisée en boucle au-delà de 6 séries. */
export const CHART_COLORS = [
  '#0b868f',
  '#7a3c53',
  '#adc3de',
  '#8f6263',
  '#94819d',
  '#c2883a',
] as const;

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
