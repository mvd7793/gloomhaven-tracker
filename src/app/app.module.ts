import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PanelModule } from './panel/panel.module';
import { DisplayComponent } from './display/display.component';
import { MonsterCellComponent } from './display/monster-cell.component';
import { MonsterNameComponent } from './display/monster-name.component';
import { PartyManagerComponent } from './party-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent,
    MonsterCellComponent,
    MonsterNameComponent,
    PartyManagerComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,

    // Custom modules
    // PanelModule,

    // UI Modules
    ProgressbarModule.forRoot(),
    TypeaheadModule.forRoot(),
    

    // AngularFire
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    // AngularFirestoreModule.enablePersistence({
    //   synchronizeTabs: true,
    // }),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
