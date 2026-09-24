import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterModule } from '@angular/router';

import { StatusMessageComponent } from './status-message.component';

describe('StatusMessageComponent', () => {
  let component: StatusMessageComponent;
  let fixture: ComponentFixture<StatusMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [StatusMessageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('annonce le chargement aux lecteurs d\'écran', () => {
    component.status = 'loading';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('affiche un message quand il n\'y a aucune donnée', () => {
    component.status = 'empty';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No data available');
  });

  it('affiche l\'erreur et demande un rechargement au clic', () => {
    component.status = 'error';
    component.message = 'Olympic data could not be loaded.';
    fixture.detectChanges();

    let asked = 0;
    component.retry.subscribe(() => asked++);

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent).toContain('could not be loaded');

    fixture.nativeElement.querySelector('button').click();
    expect(asked).toBe(1);
  });

  it('n\'affiche rien quand les données sont là', () => {
    component.status = 'loaded';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
