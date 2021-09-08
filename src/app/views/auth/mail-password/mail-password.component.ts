import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/admin/auth.service';

@Component({
  selector: 'app-mail-password',
  templateUrl: './mail-password.component.html'
})
export class MailPasswordComponent implements OnInit {
  correo;
  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
  }

  enviarCorreo(){
    this.authService.enviarCorreoCambioClave({
      email:this.correo
    }).subscribe((info)=>{
      console.log(info);
    },(error)=>{
      console.log('entra');
    })
  }
}
