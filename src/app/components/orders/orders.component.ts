import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrdersServiceService } from 'src/service/orders-service.service';

// EC1 components
import '@en-button';
import '@en-textarea';
import '@en-range-calendar';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrdersComponent implements OnInit {
  constructor(private router: ActivatedRoute) {}

  selectedDate: any;
  orderForm: FormGroup;
  orderService = inject(OrdersServiceService);
  currentUserId: any;
  orderId : string = '';
  toastProp : boolean;

  ngOnInit(): void {
    this.orderForm = new FormGroup({
      date: new FormControl(),
      orderCount: new FormControl(),
      amount: new FormControl(),
    });

    this.router.params.subscribe((params: Params) => this.currentUserId = params['userId']);
    this.toastProp = false;

    // console.log(this.currentUserId);
  }

  addOrder() {
    this.orderForm.value.date = this.selectedDate;
    this.orderForm.value.orderCount = Number(this.orderForm.value.orderCount);
    this.orderForm.value.amount = Number(this.orderForm.value.amount);
    this.orderForm.value.userId = this.currentUserId
    this.orderService.addOrders(this.orderForm.value).subscribe((response) => {
      console.log('Order added with ID :', response);
      this.orderId = response;
      this.toastProp = true;
    });
  }

  resetForm() {
    this.orderForm.reset({
      date: '',
      orderCount: '',
      amount: '',
    });
  }

  callOrders() {
    this.orderService.getOrders().subscribe((data) => {
      console.log(data);
    });
  }

  submitDate(event: any) {
    this.selectedDate = event.detail.startDate;
    document
      .getElementById('date-input')
      ?.setAttribute('value', event.detail.startDate);

  }

  onToastClick() {
    this.toastProp = false;
  }
}
