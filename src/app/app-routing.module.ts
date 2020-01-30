import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { PartyManagerComponent } from './party-manager.component';


const routes: Routes = [
  {
    path: 'display',
    component: DisplayComponent,
  },
  {
    path: '',
    component: PartyManagerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
