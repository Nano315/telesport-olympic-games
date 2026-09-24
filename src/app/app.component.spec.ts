import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('déclenche un seul chargement des données au démarrage', () => {
    const service = TestBed.inject(DataService);
    const load = spyOn(service, 'load');

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('affiche le bandeau et la zone de contenu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header img')?.getAttribute('alt')).toBe('TéléSport');
    expect(compiled.querySelector('main router-outlet')).not.toBeNull();
  });
});
