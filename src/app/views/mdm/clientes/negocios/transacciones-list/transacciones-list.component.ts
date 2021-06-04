import { Component, OnInit, ViewChild } from '@angular/core';
import {ChartOptions, ChartType, ChartDataSets} from 'chart.js';
import { Color, Label } from 'ng2-charts';
@Component({
  selector: 'app-transacciones-list',
  templateUrl: './transacciones-list.component.html',
})
export class TransaccionesListComponent implements OnInit {
  menu;
  basicDemoValue = '2017-01-01';

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio:1    
  };
  public barChartLabels: Label[] = [
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012'
  ];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = 
    [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  constructor(
  ) {

   }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "negociosTransac"
    };
    this.barChartData.push({ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'});
  }
}
