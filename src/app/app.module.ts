import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ErrorInterceptor, JwtInterceptor} from './helpers';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedModule} from './shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TOAST_NOTIFICATIONS_CONFIG, ToastNotificationsModule} from 'ngx-toast-notifications';
import {FlatpickrModule} from "angularx-flatpickr";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GdeModule} from "./views/gde/gde.module";

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        SharedModule,
        NgbModule,
        BrowserAnimationsModule,
        ToastNotificationsModule,
        FlatpickrModule,
        FormsModule,
        GdeModule,
        ReactiveFormsModule,
    ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: TOAST_NOTIFICATIONS_CONFIG, useValue: {duration: 6000, position: 'top-right', type: 'primary'}},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
