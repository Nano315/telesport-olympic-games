import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche le titre reçu', () => {
    component.title = 'Medals per Country';
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('Medals per Country');
  });

  it('affiche autant de blocs que d\'indicateurs', () => {
    component.title = 'Italy';
    component.indicators = [
      { label: 'Number of entries', value: 3 },
      { label: 'Total number of medals', value: 56 },
    ];
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('dt');
    const values = fixture.nativeElement.querySelectorAll('dd');
    expect(labels.length).toBe(2);
    expect(values[1].textContent).toContain('56');
  });

  it('n\'affiche pas de liste quand il n\'y a aucun indicateur', () => {
    component.title = 'Page';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dl')).toBeNull();
  });
});
