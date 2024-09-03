import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPageComponent } from './components/user-page/user-page.component';
import { OrdersComponent } from './components/orders/orders.component';
import { GridPageComponent } from './components/grid-page/grid-page.component';

const routes: Routes = [
  {path: '', redirectTo: '/gridPage', pathMatch: 'full'},
  {path: 'users' , component: UserPageComponent},
  {path:'orders/:userId', component: OrdersComponent},
  {path: 'gridPage',component : GridPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
