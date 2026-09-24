import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MESSAGES } from '../../app.constants';
import { LoadStatus } from '../../models/load-state';

/**
 * Ce que voit l'utilisateur quand il n'y a rien à afficher :
 * chargement, absence de données, ou erreur avec un bouton pour réessayer.
 * Composant de présentation : il ne recharge rien lui-même, il le demande.
 */
@Component({
  selector: 'app-status-message',
  templateUrl: './status-message.component.html',
  styleUrl: './status-message.component.scss',
})
export class StatusMessageComponent {
  @Input({ required: true }) status!: LoadStatus;
  @Input() message: string | null = null;
  @Output() retry = new EventEmitter<void>();

  protected readonly noDataMessage = MESSAGES.noData;
}
