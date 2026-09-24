import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { CHART_COLORS } from '../../app.constants';
import { MedalsByEdition } from '../../services/olympic.stats';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

/** Courbe des médailles d'un pays, édition par édition. */
@Component({
  selector: 'app-medals-by-edition-chart',
  templateUrl: './medals-by-edition-chart.component.html',
  styleUrl: './medals-by-edition-chart.component.scss',
})
export class MedalsByEditionChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) data: MedalsByEdition[] = [];
  @Input() countryName = '';

  @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'line', number[], number>;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.createChart());
  }

  ngOnChanges(): void {
    if (!this.chart) {
      return;
    }
    this.chart.data.labels = this.data.map((edition) => edition.year);
    this.chart.data.datasets[0].data = this.data.map((edition) => edition.medals);
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    this.chart = new Chart<'line', number[], number>(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.data.map((edition) => edition.year),
        datasets: [
          {
            label: 'Medals',
            data: this.data.map((edition) => edition.medals),
            // Sans borderColor, Chart.js trace la ligne dans le gris de la grille.
            borderColor: CHART_COLORS[0],
            backgroundColor: CHART_COLORS[0],
            pointRadius: 4,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Dates' } },
          // Sans cette option, l'axe démarre à la plus petite valeur et
          // exagère les écarts entre deux éditions.
          y: { beginAtZero: true, title: { display: true, text: 'Medals' } },
        },
        plugins: { legend: { display: false } },
      },
    });
  }
}
