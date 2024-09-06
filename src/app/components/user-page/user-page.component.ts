import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENModule } from 'en-angular';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router : Router){

  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl('',Validators.required),
      phone: new FormControl('',Validators.compose([Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10),Validators.maxLength(10)])),
      address: new FormControl('',Validators.required),
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

    setTimeout(()=>{                          
      this.router.navigate(['gridPage',this.userForm.value.name]);
    }, 3000);
    
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
