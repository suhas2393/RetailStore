import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserServiceService } from 'src/service/user-service.service';
import { OrdersServiceService } from 'src/service/orders-service.service';

import '@en-divider';
// Angular Chart Component
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions } from 'ag-charts-community';

import { Orders } from 'src/models/orders.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule,AgCharts],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})


export class AdminPanelComponent implements OnInit{

  constructor() {

    this.userService.getUsers().subscribe((data)=>{
      this.usersCount = data.length;
      console.log("Got users");
    })

    this.orderService.getOrders().subscribe((data)=>{
      this.allOrders = data;
      this.ordersCount = data.length;
      this.sortMonths(this.allOrders);
      console.log("Got Orders");
    })
    
    this.chartOptions = {
      // Data: Data to be displayed in the chart
      data: [],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'orderCount' }],
      width : 370,
      height : 300
    };

    
  }

  // Chart Options
  public chartOptions: AgChartOptions;
  chartData : any = [];


  userService = inject(UserServiceService);
  orderService = inject(OrdersServiceService);

  usersCount : number = 0; 
  ordersCount : number = 0;
  allOrders : Orders[] = [];
  
  
  ngOnInit(): void {
    
    
    this.chartOptions.data = this.chartData

  }


  sortMonths(months : Orders[]){
    let dictionary : any = {};
    // let chartDataX : any = [];
    // let chartDataY : any = [];

    months.map((data: any)=>{
      let month = new Date(data.date).toString().split(" ")[1];
      if (dictionary.hasOwnProperty(month)) {
        dictionary[month] += 1;
      }
      else{
        dictionary[month] = 1;
      }
    })
    
    
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
      // console.log(key);
      this.chartData.push({month : String(key),orderCount : sortedDictionary[key]})
    }

    console.log("Chart data :",this.chartData);
    // this.chartOptions.data = [];
    this.chartOptions.data = this.chartData;
    console.log("Chartoptions data :",this.chartOptions.data);
    // console.log(chartData);
    // return chartData;

  }



}
