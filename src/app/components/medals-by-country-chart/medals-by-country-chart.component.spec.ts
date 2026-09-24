import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalsByCountryChartComponent } from './medals-by-country-chart.component';

describe('MedalsByCountryChartComponent', () => {
  let component: MedalsByCountryChartComponent;
  let fixture: ComponentFixture<MedalsByCountryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedalsByCountryChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedalsByCountryChartComponent);
    component = fixture.componentInstance;
    component.data = [
      { id: 1, country: 'Italy', medals: 56 },
      { id: 2, country: 'Spain', medals: 20 },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('propose une alternative textuelle des données', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Italy');
    expect(rows[0].textContent).toContain('56');
  });

  it('permet de choisir un pays au clavier, hors du graphique', () => {
    const selected: number[] = [];
    component.countrySelected.subscribe((id) => selected.push(id));

    fixture.nativeElement.querySelector('tbody button').click();

    expect(selected).toEqual([1]);
  });
});
