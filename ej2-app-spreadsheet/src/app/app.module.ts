import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    SpreadsheetAllModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
