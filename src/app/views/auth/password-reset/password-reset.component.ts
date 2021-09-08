import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent implements OnInit {
  token;
  password;
  confirmPassword;
  confirmar = true;
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }
  verificarPassword() {
    if (this.password == this.confirmPassword) {
      this.confirmar = true;
    } else {
      this.confirmar = false;
    }
  }

  actualizarPassword(){
    
  }

}
