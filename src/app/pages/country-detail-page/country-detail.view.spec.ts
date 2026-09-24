import { Olympic } from '../../models/olympic';
import { toCountryDetailView } from './country-detail.view';

const italy: Olympic = {
  id: 1,
  country: 'Italy',
  participations: [
    { id: 1, year: 2016, city: 'Rio de Janeiro', medalsCount: 28, athleteCount: 375 },
    { id: 2, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
  ],
};

describe('toCountryDetailView', () => {
  it('affiche le nom du pays et ses trois indicateurs', () => {
    const view = toCountryDetailView({ status: 'loaded', data: italy });

    expect(view.status).toBe('loaded');
    expect(view.title).toBe('Italy');
    expect(view.indicators).toEqual([
      { label: 'Number of entries', value: 2 },
      { label: 'Total number of medals', value: 56 },
      { label: 'Total number of athletes', value: 747 },
    ]);
    expect(view.chart).toEqual([
      { year: 2012, medals: 28 },
      { year: 2016, medals: 28 },
    ]);
  });

  it('traite un pays introuvable comme une erreur lisible', () => {
    const view = toCountryDetailView({ status: 'loaded', data: undefined });

    expect(view.status).toBe('error');
    expect(view.message).toBe('This country does not exist.');
    expect(view.chart).toEqual([]);
  });

  it('signale un pays sans participation comme un état vide', () => {
    const view = toCountryDetailView({
      status: 'loaded',
      data: { id: 9, country: 'Nowhere', participations: [] },
    });

    expect(view.status).toBe('empty');
    expect(view.title).toBe('Nowhere');
  });

  it('transmet l\'erreur de chargement', () => {
    const view = toCountryDetailView({ status: 'error', message: 'Boom' });

    expect(view.status).toBe('error');
    expect(view.message).toBe('Boom');
  });

  it('n\'affiche rien pendant le chargement', () => {
    const view = toCountryDetailView({ status: 'loading' });

    expect(view.status).toBe('loading');
    expect(view.title).toBe('');
    expect(view.indicators).toEqual([]);
  });
});
