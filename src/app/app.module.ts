import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CountryComponent } from "./pages/country/country.component";
import { HeaderComponent } from './components/header/header.component';
import { StatusMessageComponent } from './components/status-message/status-message.component';
import { MedalsByCountryChartComponent } from './components/medals-by-country-chart/medals-by-country-chart.component';
import { MedalsByEditionChartComponent } from './components/medals-by-edition-chart/medals-by-edition-chart.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, NotFoundComponent, CountryComponent, HeaderComponent, StatusMessageComponent, MedalsByCountryChartComponent, MedalsByEditionChartComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
