import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthComponent } from './auth.component';
import { FormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { MailPasswordComponent } from './mail-password/mail-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

@NgModule({
  declarations: [AuthComponent, SignInComponent, MailPasswordComponent, PasswordResetComponent],
  imports: [
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxCaptchaModule
  ]
})
export class AuthModule { }
