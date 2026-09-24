import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../components/header/header.component';
import { MedalsByCountryChartComponent } from '../../components/medals-by-country-chart/medals-by-country-chart.component';
import { StatusMessageComponent } from '../../components/status-message/status-message.component';
import { Olympic } from '../../models/olympic';
import { DataService } from '../../services/data.service';
import { DashboardPageComponent } from './dashboard-page.component';

const olympics: Olympic[] = [
  {
    id: 1,
    country: 'Italy',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
    ],
  },
];

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let http: HttpTestingController;
  let service: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [
        DashboardPageComponent,
        HeaderComponent,
        StatusMessageComponent,
        MedalsByCountryChartComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('montre un état de chargement avant l\'arrivée des données', () => {
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('affiche les indicateurs une fois les données chargées', () => {
    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Medals per Country');
    expect(text).toContain('Number of countries');
    expect(fixture.nativeElement.querySelector('app-medals-by-country-chart')).not.toBeNull();
  });

  it('navigue vers le détail du pays choisi', () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate');

    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('tbody button').click();

    expect(navigate).toHaveBeenCalledWith(['country', 1]);
  });

  it('affiche l\'erreur et permet de réessayer', () => {
    service.load();
    http
      .expectOne(environment.olympicsUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();

    fixture.nativeElement.querySelector('[role="alert"] button').click();
    http.expectOne(environment.olympicsUrl).flush(olympics);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Number of countries');
  });
});
