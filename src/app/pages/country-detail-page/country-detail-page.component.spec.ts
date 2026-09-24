import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
  RouterModule,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../components/header/header.component';
import { MedalsByEditionChartComponent } from '../../components/medals-by-edition-chart/medals-by-edition-chart.component';
import { StatusMessageComponent } from '../../components/status-message/status-message.component';
import { Olympic } from '../../models/olympic';
import { DataService } from '../../services/data.service';
import { CountryDetailPageComponent } from './country-detail-page.component';

const olympics: Olympic[] = [
  {
    id: 1,
    country: 'Italy',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
    ],
  },
  {
    id: 2,
    country: 'Spain',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 20, athleteCount: 315 },
    ],
  },
];

describe('CountryDetailPageComponent', () => {
  let fixture: ComponentFixture<CountryDetailPageComponent>;
  let http: HttpTestingController;
  let service: DataService;
  let paramMap: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    paramMap = new BehaviorSubject<ParamMap>(convertToParamMap({ id: '1' }));

    await TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [
        CountryDetailPageComponent,
        HeaderComponent,
        StatusMessageComponent,
        MedalsByEditionChartComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryDetailPageComponent);
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  function loadData(): void {
    service.load();
    http.expectOne(environment.olympicsUrl).flush(olympics);
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('affiche le pays demandé par l\'URL', () => {
    loadData();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Italy');
    expect(text).toContain('Total number of medals');
  });

  it('suit le changement d\'identifiant sans quitter la page', () => {
    loadData();

    paramMap.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Spain');
    expect(fixture.nativeElement.textContent).not.toContain('Italy');
  });

  it('affiche un message clair pour un identifiant inconnu', () => {
    paramMap.next(convertToParamMap({ id: '404' }));
    loadData();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent).toContain('does not exist');
  });

  it('propose toujours le retour à l\'accueil', () => {
    loadData();

    const back = fixture.nativeElement.querySelector('a[href="/"]');
    expect(back).not.toBeNull();
  });
});
