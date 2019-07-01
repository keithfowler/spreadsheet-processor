import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthenticationService, public notificationService: NotificationService) {

  }

  public logout() {
    this.authService.logout();
  }
}
