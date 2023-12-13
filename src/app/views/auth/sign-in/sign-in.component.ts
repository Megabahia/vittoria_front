import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first, timeout} from 'rxjs/operators';
import {AuthService} from 'src/app/services/admin/auth.service';
import {ReCaptchaV3Service} from 'ngx-captcha';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';
import {SharedDataService} from '../../../shared/shared-data.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sing-in.component.scss'],
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
  mostrarSpinner = false;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private sharedDataService: SharedDataService,
  ) {
    this.siteKey = environment.setKey;
    this.captcha = false;
  }

  ngOnInit(): void {
    this.authService.signOut();

  }

  captchaValidado(evento): void {
    this.captcha = true;
  }

  signIn(): void {
    this.submitted = true;
    if (this.captcha) {
      this.mostrarSpinner = true;
      this.authService.signIn({username: this.username, password: this.password})
        .pipe(first())
        .subscribe((result) => {
          // this.router.navigate(['/admin/management']);
          this.sharedDataService.setSharedData(true);
          this.mostrarSpinner = false;
          window.location.href = '#/admin/management';
        }, (error) => {
          this.abrirModal(this.errorAuth);
          this.mostrarSpinner = false;
        });
    } else {

    }


  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }
}
