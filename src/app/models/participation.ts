/**
 * Une édition des Jeux olympiques à laquelle un pays a participé.
 * Forme imposée par les spécifications et par le fichier olympic.json.
 */
export interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}
