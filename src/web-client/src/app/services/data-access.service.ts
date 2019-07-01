import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { DataItem } from '../models/data-item';
import { DataType } from '../models/data-type';

@Injectable({
  providedIn: 'root'
})
export class DataAccessService {
  constructor(private _apiService: APIService) {

  }

  public async add(items: Array<DataItem>): Promise<boolean> {
    let isErr = false;

    if (items.length > 0) {
      do {
        let success = await this._postDataItems(items.splice(0, 20));
        if (!success) {
          isErr = true;
          break;
        }
      } while (items.length > 0);
    }

    return !isErr;
  }

  public async get(dataType: string, page: number): Promise<Array<any>> {
    try {
      const items = await this._apiService.getData<Array<any>>(`/svc/data/${dataType}/${page}`).toPromise();

      return items;
    } catch (err) {
      return [];
    }
  }

  public async getTypes(): Promise<DataType[]> {
    try {
      const dataTypes = this._apiService.getData<DataType[]>('/svc/data/type').toPromise();

      return dataTypes;
    } catch (err) {
      return [];
    }
  }

  public async createType(name: string): Promise<string> {
    try {
      const data = { "type": name };
      const dataType = await this._apiService.postData<{}, string>(`/svc/data/type`, data).toPromise();

      return dataType;
    } catch (err) {
      return null;
    }
  }

  private async _postDataItems(items: Array<DataItem>): Promise<boolean> {
    try {
      const success = await this._apiService.postData<Array<DataItem>, boolean>('/svc/data/batch', items).toPromise()

      return success;
    } catch (err) {
      return false;
    }
  }
}
