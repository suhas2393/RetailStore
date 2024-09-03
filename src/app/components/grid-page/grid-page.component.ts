import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';


// EC1 components
import '@en-button';
import '@en-text-field';
import '@en-dialog'
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

@Component({
  selector: 'app-grid-page',
  standalone: true,
  templateUrl: './grid-page.component.html',
  styleUrls: ['./grid-page.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule,AgGridAngular,AgGridModule,AgCharts],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridPageComponent implements OnInit {
  constructor(private router: Router) {
    this.chartOptions = {
      // Data: Data to be displayed in the chart
      data: [],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'orderCount' }],
      width : 370,
      height : 300
    };
  }
  @ViewChild('gridList', { read: AgGridAngular, static: true }) alertGrid!: AgGridAngular;

  // Chart Options
  public chartOptions: AgChartOptions;

  gridForm: FormGroup;
  allUsers: Users[];
  allOrders: Orders[];
  userInfo: any;
  showUserInfo: boolean = false;
  showRegister: boolean = false;
  colDef!: ColDef[];
  orders: Orders[] = [];
  userFound : boolean = false;

  gridApi :any;
  gridColumnApi : any;

  pagination = true
  paginationPageSize = 10
  paginationSizeSelector = [10,20]

  
  userService = inject(UserServiceService);
  orderService = inject(OrdersServiceService);

  defaultColDef : ColDef = {
    flex : 1,
    filter: true,
  }

  @Input() rowData : any[] = [];
  isGridAPIReady : boolean = false;
  gridOptions : any;
  selectedRows : any = []

  ngOnInit(): void {
    this.gridForm = new FormGroup({
      searchString: new FormControl('',Validators.compose([Validators.required])),
    });

    this.colDef = [
      {
        headerName: 'Date',
        field : 'date',
        checkboxSelection: true
      },
      {
        headerName: 'Order Count',
        field : 'orderCount',
      },
      {
        headerName: 'Amount',
        field : 'amount',
      }
    ]
  
  }

  

  ngOnChanges(changes : SimpleChanges): void {
    if (this.isGridAPIReady && changes['rowData']) {
      this.gridOptions.api.setRowData(this.rowData);
    }
  }

  sortMonths(months : Orders[]) {
    let dictionary : any = {}
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
    months.map((month)=>{
      let monthName = month['date'].toString().split(" ")[0]
      if (dictionary.hasOwnProperty(month.date.toString().split(" ")[0])) {
        dictionary[monthName] += month['orderCount'];
      }
      else{
        dictionary[monthName] = month['orderCount'];
      }
    })

    const entries = Object.entries(dictionary);
    entries.sort(([monthA], [monthB]) => monthOrder[monthA] - monthOrder[monthB]);
    const sortedDictionary : any = Object.fromEntries(entries);

    // console.log(sortedDictionary);
    for (const key in sortedDictionary) {
      // console.log(key);
      chartData.push({"month" : key,"orderCount" : sortedDictionary[key]})
    }

    console.log(chartData);
    this.chartOptions.data = chartData;
  }

  triggerSearch() {
    let count: number = 0;

    this.userService.getUsers().subscribe((data) => {
      this.userFound = false;
      this.allUsers = data;
      this.allUsers.forEach((user) => {
        if (
          user.name === this.gridForm.value.searchString ||
          user.name.toLowerCase() === this.gridForm.value.searchString ||
          String(user.phone) === this.gridForm.value.searchString ||
          user.name.charAt(0).toUpperCase() + user.name.slice(1) ===
            this.gridForm.value.searchString
        ) {
          console.log('User found :', user);
          this.userInfo = user;
          this.showUserInfo = true;
          count = 1;
        }
      });

      if (count != 1) {
        this.showRegister = true;
        this.showUserInfo = false;
        this.rowData = []
      }
      else{
        this.orderService.getOrders().subscribe((data) => {
          this.orders = [];
          this.allOrders = data;
          this.allOrders.forEach((order) => {
            if (this.userInfo.id === order.userId) {
              this.orders.push(order);
            }
          });
          console.log("All orders by " + this.userInfo.name +" is :", this.orders);
          this.rowData = this.orders;
          this.userFound = true;

          //Logic written for graph
          this.sortMonths(this.orders);

        });
      }
    });

    
  }

  resetForm() {
    this.gridForm.reset({
      searchString: '',
    });
    this.showUserInfo = false;
    this.showRegister=false;
    this.userFound = false;
  }

  goToOrders() {
    this.router.navigate(['orders', this.userInfo.id]);
  }


  onGridReady(params : any) {
    this.isGridAPIReady = true;
  }

  onSelectionChanged(event : any) {
    this.selectedRows = event.api.getSelectedRows();
  }

  deleteSelected(){
    this.selectedRows.map((selectedRow : any)=>{
      this.orderService.deleteOrders(selectedRow['id']);
    })
  }
}
