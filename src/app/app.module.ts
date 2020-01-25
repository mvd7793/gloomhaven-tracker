import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PanelModule } from './panel/panel.module';
import { DisplayComponent } from './display/display.component';
import { MonsterCellComponent } from './display/monster-cell.component';
import { MonsterNameComponent } from './display/monster-name.component';


@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent,
    MonsterCellComponent,
    MonsterNameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    // Custom modules
    PanelModule,

    // UI Modules
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),

    // AngularFire
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
