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
  AfterViewInit
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
import '@en-dialog'
import '@en-icons/add';
import '@en-icons/refresh';
import '@en-datepicker-field'
import '@en-heading'
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

import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-grid-page',
  standalone: true,
  templateUrl: './grid-page.component.html',
  styleUrls: ['./grid-page.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule,AgGridAngular,AgGridModule,AgCharts],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridPageComponent implements OnInit,OnChanges,AfterViewInit{
  constructor(private router: Router, private getParam : ActivatedRoute) {
    this.chartOptions = {
      // Data: Data to be displayed in the chart
      data: [],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'orderCount' }],
      width : 370,
      height : 300
    };

  }
  // @ViewChild('gridList', { read: AgGridAngular, static: true }) alertGrid!: AgGridAngular;
  @ViewChild('datePicker-comp') myDatePicker: ElementRef;

  // Chart Options
  public chartOptions: AgChartOptions;

  gridForm: FormGroup;
  orderForm: FormGroup
  allUsers: Users[];
  allOrders: Orders[];
  userInfo: any;
  showUserInfo: boolean = false;
  showRegister: boolean = false;
  colDef!: ColDef[];
  orders: Orders[] = [];
  userFound : boolean = false;
  orderId : string;
  toastProp : boolean;

  gridApi :any;
  gridColumnApi : any;

  pagination = true
  paginationPageSize = 10
  paginationSizeSelector = [10,20]

  
  userService = inject(UserServiceService);
  orderService = inject(OrdersServiceService);

  enableDelete : boolean = false;

  newUserName : string = '';

  defaultColDef : ColDef = {
    flex : 1,
    filter: true,
  }

  @Input() rowData : any[] = [];
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('inputForm') inputForm : any;
  @ViewChild('dialogForm') dialogForm : any;
  @ViewChild('submitButton') submitButton : any;
  isGridAPIReady : boolean = false;
  gridOptions : any;
  selectedRows : any = []

  selectedDate : number;
  rowsPresentCount: number;

  ngOnInit(): void {
    this.toastProp = false;
    this.gridForm = new FormGroup({
      searchString: new FormControl('',Validators.compose([Validators.required])),
    });

    this.orderForm = new FormGroup({
      amount : new FormControl('',Validators.compose([Validators.required,Validators.pattern("^[0-9\.]+$")]))
    })

    this.colDef = [
      {
        headerName: 'Date',
        field : 'date',
        checkboxSelection: true,
        valueFormatter: (params)=>{
          const dateString = new Date(params.value).toISOString().split("T")[0];
          return dateString.split("-").reverse().join("-");
        },
        filter : 'agDateColumnFilter',
        filterParams : {
          comparator : (filterLocalDateAtMidnight : Date, cellValue : string) => {
            let selectedDateArray = filterLocalDateAtMidnight.toString().split(" ");
            let cellValueArray = new Date(cellValue).toString().split(" ");
            if (selectedDateArray.slice(0,4).join(" ") === cellValueArray.slice(0,4).join(" ")){
              return 0;
            }
            else{
              return -1;
            }
          }
        }, 
        floatingFilter:true, 
        sort: "asc"
      },
      {
        headerName: 'Order ID',
        field : 'orderCount',
      },
      {
        headerName: 'Amount',
        field : 'amount',
      }
    ]
  
    // console.log("Localstorage item",localStorage.getItem('userInfo'));
    // console.log("Input form",this.inputForm);
    // console.log("Submit button",this.submitButton);
    this.getParam.params.subscribe((param : Params) => this.newUserName = param['username']);
  }

  ngAfterViewInit(): void {
    if (typeof this.newUserName!="undefined") {
      this.inputForm.nativeElement.__value = this.newUserName;
      this.gridForm.value.searchString = this.newUserName;
      this.submitButton.nativeElement.isDisabled = false;
      this.triggerSearch();
    }
  }

  

  ngOnChanges(changes : SimpleChanges): void {
    if (this.isGridAPIReady && changes['rowData']) {
      this.gridOptions.api.setRowData(this.rowData);
      this.gridOptions.api.refreshCells();
      console.log("Chart options data before:",this.chartOptions.data)
      this.chartOptions.data = this.rowData;
      console.log("Chart options data after:",this.chartOptions.data)
    }
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

    // console.log(sortedDictionary);
    for (const key in sortedDictionary) {
      // console.log(key);
      chartData.push({"month" : key,"orderCount" : sortedDictionary[key]})
    }

    console.log("Chart data :",chartData);
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

          this.updateChart();

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
    this.submitButton.nativeElement.isDisabled = true;
    this.router.navigate(['gridPage']);
  }

  goToOrders() {
    this.router.navigate(['orders', this.userInfo.id]);
  }


  onGridReady(params : any) {
    this.isGridAPIReady = true;
    this.rowsPresentCount = params.api.getDisplayedRowCount();
  }

  onSelectionChanged(event : any) {
    this.selectedRows = event.api.getSelectedRows();
    if (this.selectedRows.length >=1) {
      this.enableDelete = true
    }
    else{
      this.enableDelete = false;
    }
  }

  deleteSelected(){
    this.selectedRows.map((selectedRow : any)=>{
      this.orderService.deleteOrders(selectedRow['id']);
    })
    console.log(this.rowData);
  }

  onDateSelect(event : any) {
    this.selectedDate = Date.parse(event.detail.startDate);
  }
  
  addOrder() {
    
    this.orderForm.value.date = this.selectedDate;
    let count = 0
    this.agGrid.api.forEachNode(node => count = count + 1);
    this.orderForm.value.orderCount = count + 1;
    this.orderForm.value.amount = Number(this.orderForm.value.amount);
    this.orderForm.value.userId = this.userInfo.id;
    this.orderService.addOrders(this.orderForm.value).subscribe((response) => {
      console.log('Order added with ID :', response);
      this.orderId = response;
      this.toastProp = true;
    });
  }

  onToastClick() {
    this.toastProp = false;
  }

  resetOrderForm(){
    // console.log(this.myDatePicker.nativeElement())
    this.orderForm.reset({
      amount : ''
    })
    this.dialogForm.nativeElement.querySelector('#datePicker-comp').shadowRoot.querySelector('.en-c-datepicker-field__input').value=""
  }

  updateChart() {
    // console.log("Chart button click")
    this.chartOptions = {
      ...this.chartOptions,
      data : this.chartOptions.data
    }
  }

  onDialogClose(event : any){
    this.dialogForm.nativeElement.querySelector('#datePicker-comp').shadowRoot.querySelector('.en-c-datepicker-field__input').value="";
  }


}
