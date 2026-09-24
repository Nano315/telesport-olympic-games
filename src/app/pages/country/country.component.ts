import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import { Olympic } from '../../models/olympic';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public lineChart!: Chart<'line', number[], number>;
  public titlePage = '';
  public totalEntries = 0;
  public totalMedals = 0;
  public totalAthletes = 0;
  public error!: string;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {
  }

  ngOnInit() {
    let countryName: string | null = null
    this.route.paramMap.subscribe((param: ParamMap) => countryName = param.get('countryName'));
    this.http.get<Olympic[]>(this.olympicUrl).pipe().subscribe(
      (olympics) => {
        if (olympics && olympics.length > 0) {
          const selectedCountry = olympics.find((olympic) => olympic.country === countryName);
          if (!selectedCountry) {
            this.error = `No country named "${countryName}"`;
            return;
          }
          const participations = selectedCountry.participations;
          this.titlePage = selectedCountry.country;
          this.totalEntries = participations.length;
          const years = participations.map((participation) => participation.year);
          const medals = participations.map((participation) => participation.medalsCount);
          this.totalMedals = medals.reduce((total, count) => total + count, 0);
          this.totalAthletes = participations.reduce((total, participation) => total + participation.athleteCount, 0);
          this.buildChart(years, medals);
        }
      },
      (error: HttpErrorResponse) => {
        this.error = error.message
      }
    );
  }

  buildChart(years: number[], medals: number[]) {
    const lineChart = new Chart("countryChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
    this.lineChart = lineChart;
  }
}
