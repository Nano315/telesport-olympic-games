import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadState } from '../models/load-state';
import { Olympic } from '../models/olympic';
import { DataService } from './data.service';

const olympics: Olympic[] = [
  {
    id: 1,
    country: 'Italy',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
    ],
  },
];

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('commence en chargement', async () => {
    const state = await firstValueFrom(service.olympics$);
    expect(state.status).toBe('loading');
  });

  it('publie les données reçues', async () => {
    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);

    const state = await firstValueFrom(service.olympics$);
    expect(state).toEqual({ status: 'loaded', data: olympics });
  });

  it('publie un état vide quand la source ne renvoie rien', async () => {
    service.load();
    http.expectOne(environment.olympicsUrl).flush([]);

    const state = await firstValueFrom(service.olympics$);
    expect(state.status).toBe('empty');
  });

  it('publie un message quand la requête échoue', async () => {
    service.load();
    http
      .expectOne(environment.olympicsUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    const state = await firstValueFrom(service.olympics$);
    expect(state.status).toBe('error');
    expect((state as Extract<LoadState<Olympic[]>, { status: 'error' }>).message).toBeTruthy();
  });

  it('ne rejoue pas la requête pour retrouver un pays', async () => {
    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);

    const found = await firstValueFrom(service.getOlympicById(1));
    expect(found).toEqual({ status: 'loaded', data: olympics[0] });
  });

  it('renvoie undefined pour un identifiant inconnu', async () => {
    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);

    const missing = await firstValueFrom(service.getOlympicById(99));
    expect(missing).toEqual({ status: 'loaded', data: undefined });
  });
});
