import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first, timeout} from 'rxjs/operators';
import {AuthService} from 'src/app/services/admin/auth.service';
import {ReCaptchaV3Service} from 'ngx-captcha';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  providers: [],

})
export class SignInComponent implements OnInit {
  @ViewChild('errorAuth') errorAuth;
  @ViewChild('captchaElem') captchaElem;
  captcha: boolean;
  username: '';
  password: '';
  siteKey: string;
  submitted = false;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private reCaptchaV3Service: ReCaptchaV3Service,
  ) {
    this.siteKey = '6Le9XCgpAAAAAGLvVLmTUsLr057fNVB6J1-ejMum';
    this.captcha = false;
  }

  ngOnInit() {
    this.authService.signOut();

  }

  captchaValidado(evento) {
    this.captcha = true;
  }

  signIn(): void {
    this.submitted = true;
    if (this.captcha) {
      this.authService.signIn({username: this.username, password: this.password})
        .pipe(first())
        .subscribe((result) => {
          this.router.navigate(['/admin/management']);
        }, (error) => {
          this.abrirModal(this.errorAuth);
        });
    } else {

    }


  }

  abrirModal(modal) {
    this.modalService.open(modal);
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }
}
