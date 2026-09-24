import { Indicator } from '../../models/indicator';
import { LoadState, LoadStatus } from '../../models/load-state';
import { Olympic } from '../../models/olympic';
import {
  countryCount,
  editionCount,
  medalsByCountry,
  MedalsByCountry,
} from '../../services/olympic.stats';

export const DASHBOARD_TITLE = 'Medals per Country';

/** Tout ce que le template du dashboard affiche, sous une forme plate. */
export interface DashboardView {
  status: LoadStatus;
  title: string;
  indicators: Indicator[];
  chart: MedalsByCountry[];
  message: string | null;
}

/**
 * Traduit l'état du service en données d'affichage.
 * Fonction pure : testable sans Angular, et le template n'a plus aucune
 * décision à prendre.
 */
export function toDashboardView(state: LoadState<Olympic[]>): DashboardView {
  const view: DashboardView = {
    status: state.status,
    title: DASHBOARD_TITLE,
    indicators: [],
    chart: [],
    message: null,
  };

  if (state.status === 'error') {
    return { ...view, message: state.message };
  }

  if (state.status === 'loaded') {
    return {
      ...view,
      indicators: [
        { label: 'Number of countries', value: countryCount(state.data) },
        { label: 'Number of JOs', value: editionCount(state.data) },
      ],
      chart: medalsByCountry(state.data),
    };
  }

  return view;
}
