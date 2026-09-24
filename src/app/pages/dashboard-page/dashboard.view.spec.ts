import { Olympic } from '../../models/olympic';
import { DASHBOARD_TITLE, toDashboardView } from './dashboard.view';

const olympics: Olympic[] = [
  {
    id: 1,
    country: 'Italy',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
      { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 28, athleteCount: 375 },
    ],
  },
  {
    id: 2,
    country: 'Spain',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 20, athleteCount: 315 },
    ],
  },
];

describe('toDashboardView', () => {
  it('garde le titre de la page dans tous les états', () => {
    expect(toDashboardView({ status: 'loading' }).title).toBe(DASHBOARD_TITLE);
    expect(toDashboardView({ status: 'empty' }).title).toBe(DASHBOARD_TITLE);
  });

  it('n\'affiche aucun indicateur tant que les données ne sont pas là', () => {
    const view = toDashboardView({ status: 'loading' });
    expect(view.indicators).toEqual([]);
    expect(view.chart).toEqual([]);
  });

  it('calcule les deux indicateurs et les données du graphique', () => {
    const view = toDashboardView({ status: 'loaded', data: olympics });

    expect(view.status).toBe('loaded');
    expect(view.indicators).toEqual([
      { label: 'Number of countries', value: 2 },
      { label: 'Number of JOs', value: 2 },
    ]);
    expect(view.chart).toEqual([
      { id: 1, country: 'Italy', medals: 56 },
      { id: 2, country: 'Spain', medals: 20 },
    ]);
  });

  it('transmet le message d\'erreur', () => {
    const view = toDashboardView({ status: 'error', message: 'Boom' });

    expect(view.status).toBe('error');
    expect(view.message).toBe('Boom');
  });
});
