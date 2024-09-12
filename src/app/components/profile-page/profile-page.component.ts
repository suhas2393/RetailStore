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
import '@en-layout';
import '@en-textarea';
import '@en-toast';
import '@en-grid';
import { UserServiceService } from 'src/service/user-service.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  imports: [CommonModule, ENModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilePageComponent implements OnInit {
  editMode: boolean = false;
  userInfo: any = {};
  profileForm: FormGroup;
  editButtonText: string = 'Edit Profile';
  editClass : string = 'non-edit-class'
  toastProp : boolean = false;

  userService = inject(UserServiceService);
edit: any;

  constructor(private router: Router) {
    this.userInfo = router.getCurrentNavigation()?.extras.state;
    console.log('User ID', this.userInfo);
  }

  ngOnInit(): void {
    this.profileForm = new FormGroup({
      name: new FormControl(this.userInfo.name, Validators.required),
      phone: new FormControl(
        this.userInfo.phone,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
      ),
      address: new FormControl(this.userInfo.address, Validators.required),
      email: new FormControl('suhasrk233@gmail.com', Validators.required),
    });
  }

  enableEdit() {
    this.editMode = !this.editMode;
    if (this.editMode === true) {
      this.editButtonText = 'Cancel';
      this.editClass = 'edit-class'
    }
    else{
      this.editButtonText = 'Edit Profile';
      this.editClass = 'non-edit-class'
    }

  }

  updateUser() {
    this.userService.updateUsers(this.userInfo.id,this.profileForm.value).subscribe(()=>{
      this.toastProp = true;
    });
  }

  resetForm() {
    this.profileForm.reset({
      name: '',
      phone: '',
      address: '',
      email : ''
    });
  }

  onToastClick() {
    this.toastProp = false;
  }
}
