import { Olympic } from '../models/olympic';
import {
  countryCount,
  editionCount,
  medalsByCountry,
  medalsByEdition,
  participationCount,
  totalAthletes,
  totalMedals,
} from './olympic.stats';

const italy: Olympic = {
  id: 1,
  country: 'Italy',
  participations: [
    { id: 1, year: 2016, city: 'Rio de Janeiro', medalsCount: 28, athleteCount: 375 },
    { id: 2, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
  ],
};

const spain: Olympic = {
  id: 2,
  country: 'Spain',
  participations: [
    { id: 1, year: 2012, city: 'Londres', medalsCount: 20, athleteCount: 315 },
  ],
};

describe('olympic.stats', () => {
  it('compte les pays', () => {
    expect(countryCount([italy, spain])).toBe(2);
  });

  it('compte les éditions sans compter deux fois une même année', () => {
    expect(editionCount([italy, spain])).toBe(2);
  });

  it('compte les participations d\'un pays', () => {
    expect(participationCount(italy)).toBe(2);
  });

  it('additionne les médailles et les athlètes d\'un pays', () => {
    expect(totalMedals(italy)).toBe(56);
    expect(totalAthletes(italy)).toBe(747);
  });

  it('produit les totaux par pays avec leur identifiant', () => {
    expect(medalsByCountry([italy, spain])).toEqual([
      { id: 1, country: 'Italy', medals: 56 },
      { id: 2, country: 'Spain', medals: 20 },
    ]);
  });

  it('trie les éditions par année', () => {
    expect(medalsByEdition(italy)).toEqual([
      { year: 2012, medals: 28 },
      { year: 2016, medals: 28 },
    ]);
  });

  it('renvoie zéro pour un pays sans participation', () => {
    const empty: Olympic = { id: 3, country: 'Nowhere', participations: [] };
    expect(totalMedals(empty)).toBe(0);
    expect(medalsByEdition(empty)).toEqual([]);
  });
});
