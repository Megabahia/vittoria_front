import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignInComponent } from './sign-in/sign-in.component';
import { AuthComponent } from './auth.component';
import { MailPasswordComponent } from './mail-password/mail-password.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { SetPasswordComponent } from './set-password/set-password.component';

const routes: Routes = [
  {
    path: '', component: AuthComponent, children: [
      {path: '', redirectTo: 'signin', pathMatch: 'full'},
      {path: 'signin', component: SignInComponent},
      {
        path: 'recuperar-pass', children: [
          { path: '', redirectTo: 'enviar-correo', pathMatch: 'full' }, {
            path: 'enviar-correo', component: MailPasswordComponent 
          }
        ]
      },
      {
        path: 'usuario', children: [
          { path: '', redirectTo: 'reseteoPassword', pathMatch: 'full' }, {
            path: 'reseteoPassword', component: PasswordResetComponent 
          },
          {
            path: 'asignacionPassword', component: SetPasswordComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AuthRoutingModule {
}
