import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MedalsByCountryChartComponent } from './components/medals-by-country-chart/medals-by-country-chart.component';
import { MedalsByEditionChartComponent } from './components/medals-by-edition-chart/medals-by-edition-chart.component';
import { StatusMessageComponent } from './components/status-message/status-message.component';
import { CountryDetailPageComponent } from './pages/country-detail-page/country-detail-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    StatusMessageComponent,
    MedalsByCountryChartComponent,
    MedalsByEditionChartComponent,
    DashboardPageComponent,
    CountryDetailPageComponent,
    NotFoundComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
