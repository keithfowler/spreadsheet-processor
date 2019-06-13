import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'SI Data Site';
  constructor(public authService: AuthenticationService) {

  }

  public logout() {
    this.authService.logout();
  }
}
