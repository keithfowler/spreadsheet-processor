import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public model: UserModel;
  public isLoggedIn: boolean;
  public submitDisabled: boolean;

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

  async onSubmit() {
    try {
      this.submitDisabled = true;
      if (this.model.username != '' && this.model.password != '') {
        await this.authenticationService.login(this.model.username, this.model.password).toPromise();
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.model.password = '';
      this.submitDisabled = false;
    }
  }
}

class UserModel {
  public username: string;
  public password: string;
}
