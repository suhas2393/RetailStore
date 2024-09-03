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

// EC1 components
import '@en-button';
import '@en-textarea';
import '@en-toast'
import { UserServiceService } from 'src/service/user-service.service';

@Component({
  selector: 'app-user-page',
  standalone: true,
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserPageComponent implements OnInit {
  userForm: FormGroup;
  userService = inject(UserServiceService);
  toastProp : boolean;
  userId : string = '';

  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl(''),
      phone: new FormControl(''),
      address: new FormControl(''),
    });
    this.toastProp = false;
  }

  addUser() {
    this.userForm.value.phone = Number(this.userForm.value.phone);
    this.userService.addUsers(this.userForm.value).subscribe((response) => {
      console.log('User added with ID :', response);
      this.toastProp = true;
      this.userId = response;
    });
  }

  resetForm() {
    this.userForm.reset({
      name: '',
      phone: '',
      address: '',
    });
  }

  callUsers() {
    this.userService.getUsers().subscribe((data) => {
      console.log(data);
    });
  }

  onToastClick() {
    this.toastProp = false;
  }
}
