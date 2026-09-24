import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private readonly data: DataService) {}

  /** Une seule requête pour toute la session : les pages lisent le même état. */
  ngOnInit(): void {
    this.data.load();
  }
}
