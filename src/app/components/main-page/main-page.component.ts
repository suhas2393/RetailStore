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
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi } from 'ag-grid-community';
import { AgChartOptions } from 'ag-charts-community';

// import pdfMake from "C:\Users\srk\OneDrive - Extreme Networks, Inc\Desktop\RetailStore\node_modules\pdfmake\build\pdfmake.js";
// import "pdfmake/build/pdfmake";
// const pdfMake : any = window["pdfMake"]
// import * as pdfMake from '../../../../node_modules/pdfmake/build/pdfmake.js'

// EC1 components
import '@en-button';
import '@en-text-field';
import '@en-dialog';
import '@en-tooltip';
import '@en-icons/add';
import '@en-icons/refresh';
import '@en-icons/user';
import '@en-datepicker-field';
import '@en-heading';
import '@en-icons/user';
import '@en-avatar';
import '@en-icons/circle';
import '@en-icons/delete';
import '@en-icons/export';

import { UserServiceService } from 'src/service/user-service.service';
import { OrdersServiceService } from 'src/service/orders-service.service';

import { AgCharts } from 'ag-charts-angular';

import { GraphComponentComponent } from '../graph-component/graph-component.component';
import { Orders } from 'src/models/orders.model';

// import "pdfmake/build/pdfmake"
// const pdfMake = window["pdfMake"];

import * as pdfMake from 'pdfmake/build/pdfMake';
// import { Title } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { isNullOrUndef } from 'chart.js/dist/helpers/helpers.core';
import { Users } from 'src/models/users.model';

@Component({
  selector: 'app-main-page',
  standalone: true,
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  imports: [
    CommonModule,
    ENModule,
    FormsModule,
    ReactiveFormsModule,
    AgCharts,
    GraphComponentComponent,
    AgGridAngular,
    AgGridModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainPageComponent implements OnInit {
  // pdfMake : any = window["pdfMake"]
  // private http = inject(HttpClientModule);

  @ViewChild('inputForm') inputForm : any;

  totalOrders: number;
  totalUsers: any;
  totalRevenue: number;
  userForm: FormGroup;
  emailGroup : FormGroup;
  searchForm: FormGroup;
  orderForm: FormGroup;
  showAddUser: boolean = false;
  toastProp: boolean = false;
  userId: string;
  userFound: boolean;
  userInfo: any;
  showRegister: boolean = false;
  initPage: boolean = true;
  selectedDate: number;
  enableDelete: boolean;

  allOrderData : Orders[];
  allUserData : Users[];

  selectedRows : any = []

  public chartOptions: AgChartOptions;

  // AG GRID properties
  colDef!: ColDef[];
  colDefNew: ColDef[];
  userColDef : ColDef[];
  gridApi: any;
  gridOptions: any;
  gridColumnApi: any;
  pagination = true;
  paginationPageSize = 10;
  paginationSizeSelector = [10, 20];

  randomFileName: any;
  selectedFileName: any = '';

  headerText : String = '';

  userFormActive : boolean = false;
  profileFormActive : boolean = false;

  orderAddedToast : boolean = false;
  userAddedToast : boolean = false;
  emailSentToast : boolean = false;
  updateProfileToast : boolean = false;

  profileForm : FormGroup;

  @Input() rowData: any[] = [];
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('dialogForm') dialogForm : any;
  @ViewChild('userFormDialog') userFormDialog: any;
  @ViewChild('emailInput') emailInput : ElementRef;

  defaultColDef: ColDef = {
    flex: 1,
    filter: true,
  };

  constructor(
    private usersService: UserServiceService,
    private orderService: OrdersServiceService,
    private http : HttpClient
    ) {}
  ngOnInit(): void {
    this.usersService.getUsers().subscribe((data) => {
      this.totalUsers = data.length;
      this.allUserData = data;
    });

    this.orderService.getOrders().subscribe((data) => {
      let amount: number = 0;
      this.allOrderData = data;
      this.totalOrders = data.length;
      data.map((order) => {
        amount = amount + order.amount;
      });

      this.totalRevenue = amount;
      this.rowData = data;
    });

    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
      ),
      address: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
    });

    this.searchForm = new FormGroup({
      searchString: new FormControl('', Validators.required),
    });

    this.orderForm = new FormGroup({
      amount: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9.]+$'),
        ]),
      ),
    });

    this.emailGroup = new FormGroup({
      invoiceEmail: new FormControl('', Validators.required)
    })

    this.profileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
      ),
      address: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
    });

    
    

    this.colDef = [
      {
        headerName: 'Date',
        field: 'date',
        checkboxSelection: true,
        valueFormatter: (params) => {
          const dateString = new Date(params.value).toISOString().split('T')[0];
          return dateString.split('-').reverse().join('-');
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            let selectedDateArray = filterLocalDateAtMidnight
              .toString()
              .split(' ');
            let cellValueArray = new Date(cellValue).toString().split(' ');
            if (
              selectedDateArray.slice(0, 4).join(' ') ===
              cellValueArray.slice(0, 4).join(' ')
            ) {
              return 0;
            } else {
              return -1;
            }
          },
        },
        floatingFilter: true,
        sort: 'desc',
      },
      {
        headerName: 'Customer name',
        field: 'userName',
      },
      {
        headerName: 'Amount',
        field: 'amount',
        valueFormatter: (params) => {
          return '₹ ' + params.value.toFixed(2); // Formats to 2 decimal places
        }
      },
    ];

    this.colDefNew = [
      {
        headerName: 'Date',
        field: 'date',
        checkboxSelection: true,
        valueFormatter: (params) => {
          const dateString = new Date(params.value).toISOString().split('T')[0];
          return dateString.split('-').reverse().join('-');
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            let selectedDateArray = filterLocalDateAtMidnight
              .toString()
              .split(' ');
            let cellValueArray = new Date(cellValue).toString().split(' ');
            if (
              selectedDateArray.slice(0, 4).join(' ') ===
              cellValueArray.slice(0, 4).join(' ')
            ) {
              return 0;
            } else {
              return -1;
            }
          },
        },
        floatingFilter: true,
        sort: 'desc',
      },
      {
        headerName: 'Order ID',
        field: 'orderCount',
      },
      {
        headerName: 'Amount',
        field: 'amount',
        valueFormatter: (params) => {
          return '₹ ' + params.value.toFixed(2); // Formats to 2 decimal places
        }
      },
    ];

    this.userColDef = [
      {
        headerName: 'Customer Name',
        field: 'name',
      },
      {
        headerName: 'Phone number',
        field: 'phone',
      },
      {
        headerName: 'Email Address',
        field: 'email',
      },
      {
        headerName: 'Address',
        field: 'address',
      }
    ];

    this.chartOptions = {
      // Data: Data to be displayed in the chart
      data: [],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'orderCount' }],
      width: 370,
      height: 300,
    };

    this.headerText = "Recent Transactions"
  }

  showAddUserPopup() {
    this.userFormActive = true;
    this.profileFormActive = true;
    this.showAddUser = true;
  }

  resetUserForm() {
    this.userForm.reset({
      name: '',
      phone: '',
      address: '',
      email: '',
    });
  }

  addUser() {
    this.userForm.value.phone = Number(this.userForm.value.phone);
    this.userForm.value.registerDate = Date.now();
    this.usersService.addUsers(this.userForm.value).subscribe((response) => {
      console.log('User added with ID :', response);
      // this.toastProp = true;
      this.userId = response;
      this.triggerManualSearch(this.userForm.value.name);
      this.resetUserForm();
      this.userAddedToast = true;
    });

    this.userFormActive = false;

    // this.triggerManualSearch();
    
  }

  onDialogClose(event: any) {
    this.showAddUser = false;
  }

  onToastClick() {
    this.toastProp = false;
    this.userAddedToast = false;
    this.orderAddedToast = false;
    this.emailSentToast = false;
    this.updateProfileToast = false;
  }

  triggerSearch() {
    let count: number = 0;
    // this.initPage = false;
    this.agGrid.api.setGridOption('columnDefs', this.colDefNew);

    this.usersService.getUsers().subscribe((data) => {
      this.userFound = false;
      let allUsers = data;
      allUsers.forEach((user) => {
        if (
          user.name === this.searchForm.value.searchString ||
          user.name.toLowerCase() === this.searchForm.value.searchString ||
          String(user.phone) === this.searchForm.value.searchString ||
          user.name.charAt(0).toUpperCase() + user.name.slice(1) ===
            this.searchForm.value.searchString
        ) {
          console.log('User found :', user);
          this.userInfo = user;
          // this.showUserInfo = true;
          count = 1;
        }
      });

      if (count != 1) {
        // console.log("User not found!!!");
        this.toastProp = true;
        this.showRegister = true;
        this.userFound = false;
        this.rowData = []
      } else {
        this.orderService.getOrders().subscribe((data) => {
          this.totalRevenue = 0;
          let orders: any = [];
          let allOrders = data;
          allOrders.forEach((order) => {
            if (this.userInfo.id === order.userId) {
              orders.push(order);
              this.totalRevenue = this.totalRevenue + order.amount;
            }
          });
          console.log('All orders by ' + this.userInfo.name + ' is :', orders);
          this.rowData = orders;
          this.totalOrders = orders.length;
          this.userFound = true;
          //Logic written for graph
          this.sortMonths(orders);
          let orderLocal : any = [];
          this.rowData.map((order)=>{
            if(this.userInfo.name === order.userName){
              orderLocal.push(order);
            }
          })
          if(orderLocal.length === 0) {
            this.totalUsers = "No orders"
          }
          else{
            orderLocal.sort((a : any, b : any) => {
              return b.date - a.date;
            });

            this.totalUsers = String(new Date(orderLocal[0].date).toString().split(" ").splice(1,3).join(" "));
          }
          


          this.chartOptions.data = [{'month' : 'Aug' , 'orderCount' : 2 }]
        });

        this.headerText = `Recent transactions of user ${this.userInfo.name}`


        this.profileForm.controls['name'].setValue(this.userInfo.name);
        this.profileForm.controls['phone'].setValue(String(this.userInfo.phone));
        this.profileForm.controls['address'].setValue(this.userInfo.address);
        this.profileForm.controls['email'].setValue(this.userInfo.email);

      }
    });
  }

  onGridReady(params: any) {
    // this.isGridAPIReady = true;
    // this.rowsPresentCount = params.api.getDisplayedRowCount();
  }

  

  onDateSelect(event: any) {
    this.selectedDate = Date.parse(event.detail.startDate);
  }

  addOrder() {
    this.orderForm.value.date = this.selectedDate;
    let count = 0;
    this.agGrid.api.forEachNode((node) => (count = count + 1));
    this.orderForm.value.orderCount = count + 1;
    this.orderForm.value.amount = Number(this.orderForm.value.amount);
    this.orderForm.value.userId = this.userInfo.id;
    this.orderForm.value.userName = this.userInfo.name;
    this.orderService.addOrders(this.orderForm.value).subscribe((response) => {
      console.log('Order added with ID :', response);
      // this.orderId = response;
      // this.toastProp = true;
      this.orderAddedToast = true;
    });
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

  resetOrderForm() {
    this.orderForm.reset({
      amount : ''
    })
    this.dialogForm.nativeElement.querySelector('#datePicker-comp').shadowRoot.querySelector('.en-c-datepicker-field__input').value=""
  }

  deleteSelected() {
    this.selectedRows.map((selectedRow : any)=>{
      this.orderService.deleteOrders(selectedRow['id']);
    })
    console.log(this.rowData);
  }

  sortMonths(months: Orders[]) {
    // let epochMonths = [];
    let dictionary: any = {};
    months.map((data: any) => {
      let month = new Date(data.date).toString().split(' ')[1];
      if (dictionary.hasOwnProperty(month)) {
        // dictionary[monthName] += month['orderCount'];
        dictionary[month] += 1;
      } else {
        // dictionary[monthName] = month['orderCount'];
        dictionary[month] = 1;
      }
    });

    let chartData: any = [];
    const monthOrder: any = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };

    const entries = Object.entries(dictionary);
    entries.sort(
      ([monthA], [monthB]) => monthOrder[monthA] - monthOrder[monthB],
    );
    const sortedDictionary: any = Object.fromEntries(entries);

    // console.log(sortedDictionary);
    for (const key in sortedDictionary) {
      // console.log(key);
      chartData.push({ month: key, orderCount: sortedDictionary[key] });
    }

    console.log('Chart data :', chartData);
    this.chartOptions.data = chartData;
  }

  sendEmail() {
    const fileData = this.selectedFileName;
    console.log("File data : ",fileData)
    const emailUrl = 'http://localhost:3000/send-email';

    const data = {
      name: this.userInfo.name,
      email: this.emailGroup.value.invoiceEmail,
      filename : fileData
    };

    this.http.post(emailUrl, data).subscribe((data: any) => {
      if (data.message === "Email sent successfully") {
        this.emailSentToast = true;
      }
      
    });
  }

  exportPdf() {
    const doc: any = this.getDocument(this.agGrid.api);
    pdfMake.createPdf(doc).download(doc.info.title);
  }

  getDocument(gridApi: any) {
    const columns = this.agGrid.api.getAllDisplayedColumns();

    const headerRow = this.getHeaderToExport(this.agGrid.api);
    const rows = this.getRowsToExport(this.agGrid.api);

    this.randomFileName = Math.floor(Math.random() * 10) + 1;

    return {
      pageOrientation: 'landscape', // can also be 'portrait'
      info: {
        title: 'Invoice-pdf' + String(this.randomFileName),
      },
      content: [
        {
          text: 'Retail Store',
          fontSize: 20,
          alignment: 'center',
          // color : '#067896'
        },
        { text: 'Date', bold: true, fontSize: 15, alignment: 'right' },
        {
          text: new Date().toLocaleDateString(),
          fontSize: 10,
          alignment: 'right',
        },

        {
          text: 'User Information',
          bold: true,
          fontSize: 10,
          alignment: 'left',
        },
        {
          // to treat a paragraph as a bulleted list, set an array of items under the ul key
          ul: [
            { text: 'Name : ' + this.userInfo.name, alignment: 'left' },
            {
              text: 'Phone number : ' + this.userInfo.phone,
              alignment: 'left',
            },
            {
              text: 'Email address : ' + this.userInfo.email,
              alignment: 'left',
            },
          ],
        },
        { text: ' ' },
        { text: 'Recent transcations', fontSize: 10, bold: true },
        { text: ' ' },

        {
          table: {
            // the number of header rows
            headerRows: 1,

            // the width of each column, can be an array of widths
            widths: `${100 / columns.length}%`,

            // all the rows to display, including the header rows
            body: [headerRow, ...rows],

            // Header row is 40px, other rows are 15px
            heights: (rowIndex: any) => (rowIndex === 0 ? 40 : 15),
          },
        },
        { text: ' ' },
        {
          text: 'Thank you for ordering, Visit again..',
          fontSize: 10,
          alignment: 'center',
          // color : '#067896'
        },
      ],
    };
  }

  getHeaderToExport(gridApi: any) {
    const columns = gridApi.getAllDisplayedColumns();

    return columns.map((column: any) => {
      const { field } = column.getColDef();
      const sort = column.getSort();
      const headerNameUppercase = field[0].toUpperCase() + field.slice(1);
      const headerCell = {
        text: headerNameUppercase + (sort ? ` (${sort})` : ''),
      };
      return headerCell;
    });
  }

  getRowsToExport(gridApi: any) {
    const columns = gridApi.getAllDisplayedColumns();

    const getCellToExport = (column: any, node: any) => ({
      text:
        column.colDef.field === 'date'
          ? new Date(gridApi.getValue(column, node))
              .toLocaleString()
              .split(',')[0]
          : gridApi.getValue(column, node),
    });

    const rowsToExport: any = [];
    gridApi.forEachNodeAfterFilterAndSort((node: any) => {
      const rowToExport = columns.map((column: any) =>
        getCellToExport(column, node),
      );
      rowsToExport.push(rowToExport);
    });

    return rowsToExport;
  }

  handleUpload(event: any) {
    // console.log(event.target?.files[0].name);

    const file = event.target.files[0];
    // console.log(file);
    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = () => {
      // this.selectedFileName = reader.result;
    // };
    this.selectedFileName = file.name;
  }

  triggerManualSearch(username : any) {
    this.searchForm.value.searchString = username;
    this.inputForm.nativeElement.__value = username;
    setTimeout(()=>{
      this.triggerSearch()
    },3000);
  }


  updateProfile() {
    this.usersService.updateUsers(this.userInfo.id,this.profileForm.value).subscribe(()=>{
      // this.toastProp = true;
      console.log("Profile updated");
      console.log(this.profileForm.value);
    });

    this.profileFormActive = false;
    this.updateProfileToast = true;
  }

  useDefaultEmail(checkBoxEvent : any) {
    console.log(checkBoxEvent)
    // if (this.userFound && checkBoxEvent.detail.checked) {
    //   console.log(this.userInfo.email);
    //   this.emailInput.nativeElement.value = this.userInfo.email;
    // }
  } 

  showOrdersInTable() {
    console.log(this.allOrderData);
    this.rowData = this.allOrderData
    this.agGrid.api.setGridOption('columnDefs', this.colDefNew);
    
  }
  showUsersInTable(){
    console.log(this.allUserData);
    this.rowData = this.allUserData;
    
    this.agGrid.api.setGridOption('columnDefs', this.userColDef);

    
  }
}
