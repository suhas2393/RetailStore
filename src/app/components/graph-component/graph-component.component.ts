import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {Chart,registerables} from 'chart.js/auto';
Chart.register(...registerables)

// EC1 components
import '@en-layout';
import '@en-textarea';
import '@en-toast';
import '@en-grid';
import { UserServiceService } from 'src/service/user-service.service';

// Angular Chart Component
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions } from 'ag-charts-community';
import { OrdersServiceService } from 'src/service/orders-service.service';

import { Orders } from 'src/models/orders.model';


@Component({
  selector: 'app-graph-component',
  standalone: true,
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule,AgCharts],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GraphComponentComponent implements OnInit {

  myChart : any = null;

  orderData : any = [];

  chartData:any;

  labelData : any[] = [];
  realData : any[] = [];
  colorData : any[] = [];

  constructor( private orderService : OrdersServiceService){
    
  }

  ngOnInit(): void {
    
    this.orderService.getOrders().subscribe((data)=>{
      this.chartData = data;

      if (this.chartData!=null) {
        let dataObject = []
        dataObject = this.sortMonths(this.chartData);
        for(let i=0;i<dataObject.length;i++) {
          this.labelData.push(dataObject[i].month);
          this.realData.push(dataObject[i].orderCount);
        }

        this.RenderCharts(this.labelData,this.realData);
        
      }
    })
  }


  sortMonths(months : Orders[]) {
    // let epochMonths = [];
    let dictionary : any = {}
    months.map((data: any)=>{
      let month = new Date(data.date).toString().split(" ")[1];
      if (dictionary.hasOwnProperty(month)) {
        // dictionary[monthName] += month['orderCount'];
        dictionary[month] += 1;
      }
      else{
        // dictionary[monthName] = month['orderCount'];
        dictionary[month] = 1;
      }
    })
    
    let chartData : any = [];
    const monthOrder : any = {
      "Jan": 1,
      "Feb": 2,
      "Mar": 3,
      "Apr": 4,
      "May": 5,
      "Jun": 6,
      "Jul": 7,
      "Aug": 8,
      "Sep": 9,
      "Oct": 10,
      "Nov": 11,
      "Dec": 12
  };

    const entries = Object.entries(dictionary);
    entries.sort(([monthA], [monthB]) => monthOrder[monthA] - monthOrder[monthB]);
    const sortedDictionary : any = Object.fromEntries(entries);

    for (const key in sortedDictionary) {
      chartData.push({"month" : key,"orderCount" : sortedDictionary[key]})
    }
    return chartData;

  }


  RenderCharts(labelData : any, mainData : any){

    labelData = Array.from(new Set(labelData));
    // mainData = Array.from(new Set(mainData));
    mainData = mainData.slice(0,labelData.length)

    let bgColorArray = [];
    let borderColorArray = [];
    

    for(let i=0;i<labelData.length;i++) {
      // let r = Math.floor(Math.random() * 256);
      let r = 137;
      let g = 129;
      let b = 229;
      // let g = Math.floor(Math.random() * 256);
      // let b = Math.floor(Math.random() * 256);
      bgColorArray.push('rgba'+ '(' + String(r) + ',' + String(g) + ',' + String(b) + ',' + '0.5)');
      // borderColorArray.push('rgba'+ '(' + String(r) + ',' + String(g) + ',' + String(b) + ',' + '1)');
    }

    if (this.myChart!=null) {
      this.myChart.destroy();
    }
    this.myChart = new Chart("piechart", {
      type: 'line',
      data: {
          labels: labelData,
          datasets: [{
              label: 'Order count',
              data: mainData,
              fill: false,
              // backgroundColor: bgColorArray,
              borderColor: bgColorArray,
              // borderWidth: 1
          }]
      },
      options: {
        animations: {
          tension: {
            duration: 3000,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: true
          }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
    });

  }
}

