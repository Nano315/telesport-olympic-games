import { Participation } from './participation';

/**
 * Un pays et l'ensemble de ses participations aux Jeux olympiques.
 * Forme imposée par les spécifications et par le fichier olympic.json.
 */
export interface Olympic {
  id: number;
  country: string;
  participations: Participation[];
}
