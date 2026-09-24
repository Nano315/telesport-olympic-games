import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js';
import { chartColor } from '../../app.constants';
import { MedalsByCountry } from '../../services/olympic.stats';

Chart.register(PieController, ArcElement, Tooltip, Legend);

/**
 * Camembert des médailles par pays.
 * Reçoit des données déjà calculées, et signale le pays choisi sans
 * naviguer lui-même : la navigation est l'affaire de la page.
 */
@Component({
  selector: 'app-medals-by-country-chart',
  templateUrl: './medals-by-country-chart.component.html',
  styleUrl: './medals-by-country-chart.component.scss',
})
export class MedalsByCountryChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) data: MedalsByCountry[] = [];
  @Output() countrySelected = new EventEmitter<number>();

  @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'pie', number[], string>;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    // Hors de la zone Angular : les animations et le survol de Chart.js ne
    // doivent pas déclencher de détection de changements.
    this.zone.runOutsideAngular(() => this.createChart());
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    this.chart = new Chart<'pie', number[], string>(this.canvas.nativeElement, {
      type: 'pie',
      data: this.buildData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (item) => `${item.label}: ${item.parsed} medals`,
            },
          },
        },
        onClick: (_event, elements) => {
          const country = this.data[elements[0]?.index];
          if (country) {
            this.zone.run(() => this.countrySelected.emit(country.id));
          }
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      return;
    }
    const { labels, datasets } = this.buildData();
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = datasets[0].data;
    this.chart.data.datasets[0].backgroundColor = datasets[0].backgroundColor;
    this.chart.update();
  }

  private buildData() {
    return {
      labels: this.data.map((country) => country.country),
      datasets: [
        {
          label: 'Medals',
          data: this.data.map((country) => country.medals),
          backgroundColor: this.data.map((_country, index) => chartColor(index)),
          hoverOffset: 4,
        },
      ],
    };
  }
}
