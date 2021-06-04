import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxCaptchaModule } from 'ngx-captcha';
import { allIcons } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [
    FooterComponent,ToolbarComponent,NavbarComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgxCaptchaModule,
    FeatherModule.pick(allIcons)
  ],
  exports:[FooterComponent,ToolbarComponent,NavbarComponent,FeatherModule]
})
export class SharedModule { }
