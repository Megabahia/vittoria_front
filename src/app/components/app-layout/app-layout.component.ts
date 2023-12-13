import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SharedDataService} from '../../shared/shared-data.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/admin/auth.service';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit, OnDestroy, OnChanges {
  @Input() menu: any;
  private subscription: Subscription;
  public isLoggedIn = false;

  constructor(private sharedDataService: SharedDataService, private authService: AuthService) {
    this.subscription = this.sharedDataService.getSharedData().subscribe(data => {
      console.log('datos', data);
      this.isLoggedIn = data;
    });
  }

  ngOnInit(): void {
    console.log('inicio');
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.authService.isLoggedIn()) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
   ngOnChanges(): void {
     console.log('cambia');
      const currentUser = this.authService.currentUserValue;
      if ( currentUser && this.authService.isLoggedIn()) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
