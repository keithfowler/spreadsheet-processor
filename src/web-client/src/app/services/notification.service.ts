import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications: Array<Notification> = [];

  constructor() { }

  public get notifications(): Array<Notification> {
    return this._notifications;
  }

  public addNotification(message: string, isError: boolean) {
    this._notifications.push(new Notification(message, isError));
  }

  public removeNotification(notification: Notification){
    this._notifications.splice(this._notifications.indexOf(notification), 1);
  }
}

class Notification {
  public message: string;
  public isError: boolean;

  constructor(message: string, isError: boolean) {
    this.message = message;
    this.isError = isError;
  }
}
