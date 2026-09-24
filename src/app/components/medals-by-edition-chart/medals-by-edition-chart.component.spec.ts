import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalsByEditionChartComponent } from './medals-by-edition-chart.component';

describe('MedalsByEditionChartComponent', () => {
  let component: MedalsByEditionChartComponent;
  let fixture: ComponentFixture<MedalsByEditionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedalsByEditionChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedalsByEditionChartComponent);
    component = fixture.componentInstance;
    component.countryName = 'Italy';
    component.data = [
      { year: 2012, medals: 28 },
      { year: 2016, medals: 28 },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('décrit le graphique aux lecteurs d\'écran', () => {
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('aria-label')).toContain('Italy');
  });

  it('propose une alternative textuelle des données', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('2016');
  });
});
