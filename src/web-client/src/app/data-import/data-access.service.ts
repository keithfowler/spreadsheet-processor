import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { DataItem, DataProp } from './data-item';

@Injectable({
  providedIn: 'root'
})
export class DataAccessService {

  private _httpOptions: {};

  constructor(private http: HttpClient) {
    this._httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  public async add(items: Array<DataItem>): Promise<boolean> {
    let continueProcessing = true;
    let isErr = false;

    do {
      let postItems: Array<DataItem> = [];

      if (items.length > 20) {
        for (let i = 0; i <= 20; i++) {
          postItems.push(items.shift());
        }
      } else {
        if (items.length > 0) {
          postItems = postItems.concat(items);
          items = [];
        }
      }

      if (postItems.length > 0) {
        const response = await this._postDataItems(postItems);

        if (!response) {
          continueProcessing = false;
          isErr = true;
        }
      } else {
        continueProcessing = false;
      }
    } while (continueProcessing == true);

    return !isErr;
  }

  private async _postDataItems(items: Array<DataItem>): Promise<boolean> {
    try {
      const response = await this.http.post<Array<DataItem>>(`/svc/data/batch`, items, this._httpOptions).toPromise();

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }
}
