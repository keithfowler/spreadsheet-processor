import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public model: UserModel;
  public isLoggedIn: boolean;
  public submitDisabled: boolean;
  public isValid: boolean = true;

  constructor(public authenticationService: AuthenticationService) {
    this.model = new UserModel();
    this.submitDisabled = false;
  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      this.isLoggedIn = true;
    }
  }

  onSubmit() {
    this.submitDisabled = true;
    if (this.model.username != '' && this.model.password != '') {
      const userName = this.model.username.toLowerCase();

      this.authenticationService.login(this.model.username, this.model.password).subscribe(success => {
        this.isValid = success;
        this.submitDisabled = false;
        this.model.password = '';
      });
    }
  }
}

class UserModel {
  public username: string;
  public password: string;
}
