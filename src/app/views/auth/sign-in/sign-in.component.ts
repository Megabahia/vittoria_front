import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout } from 'rxjs/operators';
import { AuthService } from 'src/app/services/admin/auth.service';
// import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment'

// import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  providers: [],

})
export class SignInComponent implements OnInit {


  username: '';
  password: '';


  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.authService.signOut();
  }


  signIn(): void {
   this.authService.signIn({ 'username': this.username, 'password': this.password })
   .pipe(first())
   .subscribe((result)=>{
    
      window.location.href='/admin/management';
   
   },(error)=>{

   });
  
  }

}
