import { Olympic } from '../models/olympic';

/** Un pays et son total de médailles, tel que l'attend le camembert du dashboard. */
export interface MedalsByCountry {
  id: number;
  country: string;
  medals: number;
}

/** Une édition et le nombre de médailles obtenues, tel que l'attend la courbe. */
export interface MedalsByEdition {
  year: number;
  medals: number;
}

/**
 * Calculs métier, en fonctions pures : aucune dépendance à Angular,
 * donc testables sans TestBed. C'est ici, et nulle part ailleurs, qu'on
 * décide ce qu'est un « total de médailles ».
 */

export function countryCount(olympics: Olympic[]): number {
  return olympics.length;
}

export function editionCount(olympics: Olympic[]): number {
  const years = olympics.flatMap((olympic) =>
    olympic.participations.map((participation) => participation.year)
  );
  return new Set(years).size;
}

export function participationCount(olympic: Olympic): number {
  return olympic.participations.length;
}

export function totalMedals(olympic: Olympic): number {
  return olympic.participations.reduce(
    (total, participation) => total + participation.medalsCount,
    0
  );
}

export function totalAthletes(olympic: Olympic): number {
  return olympic.participations.reduce(
    (total, participation) => total + participation.athleteCount,
    0
  );
}

export function medalsByCountry(olympics: Olympic[]): MedalsByCountry[] {
  return olympics.map((olympic) => ({
    id: olympic.id,
    country: olympic.country,
    medals: totalMedals(olympic),
  }));
}

export function medalsByEdition(olympic: Olympic): MedalsByEdition[] {
  return olympic.participations
    .map((participation) => ({
      year: participation.year,
      medals: participation.medalsCount,
    }))
    .sort((a, b) => a.year - b.year);
}
