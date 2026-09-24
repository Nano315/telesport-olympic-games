import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { Olympic } from '../../models/olympic';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public pieChart!: Chart<"pie", number[], string>;
  public totalCountries = 0;
  public totalJOs = 0;
  public error!: string;
  public titlePage = 'Medals per Country';

  constructor(private router: Router, private http:HttpClient) { }

  ngOnInit() {
    this.http.get<Olympic[]>(this.olympicUrl).pipe().subscribe(
      (olympics) => {
        console.log(`Liste des données : ${JSON.stringify(olympics)}`);
        if (olympics && olympics.length > 0) {
          const years = olympics.flatMap((olympic) => olympic.participations.map((participation) => participation.year));
          this.totalJOs = new Set(years).size;
          const countries = olympics.map((olympic) => olympic.country);
          this.totalCountries = countries.length;
          const medalsPerCountry = olympics.map((olympic) =>
            olympic.participations.reduce((total, participation) => total + participation.medalsCount, 0)
          );
          this.buildPieChart(countries, medalsPerCountry);
        }
      },
      (error:HttpErrorResponse) => {
        console.log(`erreur : ${error}`);
        this.error = error.message
      }
    )
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart;
  }
}

