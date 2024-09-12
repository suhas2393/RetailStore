import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges,
  ElementRef,
  OnChanges,
  AfterViewInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';


// EC1 components
import '@en-button';
import '@en-text-field';
import '@en-dialog';
import '@en-tooltip';
import '@en-icons/add';
import '@en-icons/refresh';
import '@en-icons/user';
import '@en-datepicker-field'
import '@en-heading';
import '@en-icons/user';
import '@en-avatar';

import { UserServiceService } from 'src/service/user-service.service';
import { Users } from 'src/models/users.model';
import { OrdersServiceService } from 'src/service/orders-service.service';
import { Orders } from 'src/models/orders.model';

import { ColDef } from 'ag-grid-community';

// import 'ag-grid-enterprise';
// Angular Chart Component
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions } from 'ag-charts-community';
import { GraphComponentComponent } from "../graph-component/graph-component.component";


@Component({
  selector: 'app-main-page',
  standalone: true,
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule, AgGridAngular, AgGridModule, AgCharts, GraphComponentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainPageComponent implements OnInit {

  totalOrders  : number;
  totalUsers : number;
  totalRevenue : number;

  @Output() allOrders : any = []


  constructor(private usersService : UserServiceService , private orderService : OrdersServiceService){

  }
  ngOnInit(): void {
    this.usersService.getUsers().subscribe((data)=>{
      this.totalUsers = data.length;
    })

    this.orderService.getOrders().subscribe((data)=>{
      let amount : number= 0;
      this.allOrders = data;
      this.totalOrders = data.length;
      // console.log(data);
      data.map((order)=>{
        amount = amount + order.amount;
      })

      this.totalRevenue = amount;

      this.sortMonths(data);


    })
    // throw new Error('Method not implemented.');
  }

  sortMonths(months : Orders[]) {
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

    // console.log(sortedDictionary);
    for (const key in sortedDictionary) {
      // console.log(key);
      chartData.push({"month" : key,"orderCount" : sortedDictionary[key]})
    }

    console.log("Chart data :",chartData);
    // this.chartOptions.data = chartData;
    // this.ordersGraphData = chartData
  }

  

}
