import { Component, Input } from '@angular/core';
import { Indicator } from '../../models/indicator';

/**
 * En-tête commun aux deux pages : un titre et une liste d'indicateurs.
 * Composant de présentation : il ne connaît ni le service, ni le routeur.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input({ required: true }) title = '';
  @Input() indicators: Indicator[] = [];
}
