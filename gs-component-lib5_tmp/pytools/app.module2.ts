import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { SpreadsheetAllModule } from '@devg1120/gs-angular-spreadsheet';
import { SpreadsheetAllModule } from '@devg1120/gs-angular-spreadsheet';


import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule ,
    SpreadsheetAllModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
