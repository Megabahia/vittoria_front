import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/admin/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-mail-password',
  templateUrl: './mail-password.component.html'
})
export class MailPasswordComponent implements OnInit {
  correo = '';
  public submitted;
  public form: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.form.controls;
  }

  enviarCorreo(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.authService.enviarCorreoCambioClave({
      email: this.correo
    }).subscribe((info) => {
      console.log(info);
      this.submitted = false;
      this.router.navigate(['auth/signin']);
    }, (error) => {
    });
  }
}
