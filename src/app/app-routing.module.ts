import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { COUNTRY_ROUTE_SEGMENT } from './app.constants';
import { CountryDetailPageComponent } from './pages/country-detail-page/country-detail-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
  },
  {
    // L'identifiant, et non le nom du pays : c'est ce qu'exposera l'API.
    path: `${COUNTRY_ROUTE_SEGMENT}/:id`,
    component: CountryDetailPageComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
