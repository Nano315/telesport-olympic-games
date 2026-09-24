import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { COUNTRY_ROUTE_SEGMENT } from '../../app.constants';
import { DataService } from '../../services/data.service';
import { DashboardView, toDashboardView } from './dashboard.view';

/**
 * Page d'accueil : les totaux de médailles de tous les pays.
 * Elle orchestre et ne calcule rien.
 */
@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  protected readonly view$: Observable<DashboardView>;

  constructor(
    private readonly data: DataService,
    private readonly router: Router
  ) {
    this.view$ = this.data.olympics$.pipe(map(toDashboardView));
  }

  protected openCountry(id: number): void {
    this.router.navigate([COUNTRY_ROUTE_SEGMENT, id]);
  }

  protected reload(): void {
    this.data.load();
  }
}
