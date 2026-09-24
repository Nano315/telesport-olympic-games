import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MESSAGES } from '../app.constants';
import { LoadState } from '../models/load-state';
import { Olympic } from '../models/olympic';

/**
 * Seule porte d'entrée des données de l'application.
 * Singleton (providedIn: 'root') : les deux pages lisent le même état,
 * donc le fichier n'est chargé qu'une fois par session.
 * Le jour où l'API REST remplace le mock, seul ce fichier et l'URL
 * de l'environnement changent.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly state = new BehaviorSubject<LoadState<Olympic[]>>({
    status: 'loading',
  });

  constructor(private readonly http: HttpClient) {}

  /** Flux partagé par toutes les pages. */
  get olympics$(): Observable<LoadState<Olympic[]>> {
    return this.state.asObservable();
  }

  /** Charge ou recharge les données. Appelé au démarrage et par le bouton « Retry ». */
  load(): void {
    this.state.next({ status: 'loading' });
    this.http
      .get<Olympic[]>(environment.olympicsUrl)
      .pipe(
        map((olympics): LoadState<Olympic[]> =>
          olympics?.length ? { status: 'loaded', data: olympics } : { status: 'empty' }
        ),
        catchError(() =>
          of<LoadState<Olympic[]>>({ status: 'error', message: MESSAGES.loadError })
        )
      )
      .subscribe((state) => this.state.next(state));
  }

  /**
   * Un pays, par son identifiant.
   * Le `undefined` est volontaire : un pays absent du mock aujourd'hui et
   * un 404 de l'API demain se traitent alors au même endroit.
   */
  getOlympicById(id: number): Observable<LoadState<Olympic | undefined>> {
    return this.olympics$.pipe(
      map((state): LoadState<Olympic | undefined> => {
        if (state.status !== 'loaded') {
          return state;
        }
        return {
          status: 'loaded',
          data: state.data.find((olympic) => olympic.id === id),
        };
      })
    );
  }
}
