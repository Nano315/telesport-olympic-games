import { MESSAGES } from '../../app.constants';
import { Indicator } from '../../models/indicator';
import { LoadState, LoadStatus } from '../../models/load-state';
import { Olympic } from '../../models/olympic';
import {
  medalsByEdition,
  MedalsByEdition,
  participationCount,
  totalAthletes,
  totalMedals,
} from '../../services/olympic.stats';

/** Tout ce que le template de la page pays affiche, sous une forme plate. */
export interface CountryDetailView {
  status: LoadStatus;
  title: string;
  countryName: string;
  indicators: Indicator[];
  chart: MedalsByEdition[];
  message: string | null;
}

/**
 * Traduit l'état du service en données d'affichage.
 * C'est ici que le pays introuvable devient une erreur lisible, qu'il
 * vienne d'un identifiant absent du mock ou, demain, d'un 404 de l'API.
 */
export function toCountryDetailView(
  state: LoadState<Olympic | undefined>
): CountryDetailView {
  const view: CountryDetailView = {
    status: state.status,
    title: '',
    countryName: '',
    indicators: [],
    chart: [],
    message: null,
  };

  if (state.status === 'error') {
    return { ...view, message: state.message };
  }

  if (state.status !== 'loaded') {
    return view;
  }

  const olympic = state.data;
  if (!olympic) {
    return { ...view, status: 'error', message: MESSAGES.unknownCountry };
  }

  if (olympic.participations.length === 0) {
    return { ...view, status: 'empty', title: olympic.country, countryName: olympic.country };
  }

  return {
    ...view,
    title: olympic.country,
    countryName: olympic.country,
    indicators: [
      { label: 'Number of entries', value: participationCount(olympic) },
      { label: 'Total number of medals', value: totalMedals(olympic) },
      { label: 'Total number of athletes', value: totalAthletes(olympic) },
    ],
    chart: medalsByEdition(olympic),
  };
}
