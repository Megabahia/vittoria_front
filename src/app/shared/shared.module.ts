import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    FooterComponent,ToolbarComponent,NavbarComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  exports:[FooterComponent,ToolbarComponent,NavbarComponent]
})
export class SharedModule { }
