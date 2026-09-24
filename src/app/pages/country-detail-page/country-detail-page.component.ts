import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CountryDetailView, toCountryDetailView } from './country-detail.view';

/**
 * Page de détail d'un pays.
 * Le paramètre de route et les données sont composés par switchMap :
 * si l'identifiant change sans quitter la page, l'affichage suit.
 */
@Component({
  selector: 'app-country-detail-page',
  templateUrl: './country-detail-page.component.html',
  styleUrl: './country-detail-page.component.scss',
})
export class CountryDetailPageComponent {
  protected readonly view$: Observable<CountryDetailView>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly data: DataService
  ) {
    this.view$ = this.route.paramMap.pipe(
      switchMap((params) => this.data.getOlympicById(Number(params.get('id')))),
      map(toCountryDetailView)
    );
  }

  protected reload(): void {
    this.data.load();
  }
}
