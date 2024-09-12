import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ENModule } from 'en-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// import {AngularFireModule} from '@angular/fire';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import {getFirestore , provideFirestore} from '@angular/fire/firestore'

// 2. Add your credentials from step 1
import { environment } from 'src/environments/environment';
import { MainPageComponent } from './components/main-page/main-page.component';
import { GraphComponentComponent } from './components/graph-component/graph-component.component';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ENModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  providers: [
    provideFirebaseApp(()=> initializeApp(environment.firebase)),
    provideFirestore(()=> getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
