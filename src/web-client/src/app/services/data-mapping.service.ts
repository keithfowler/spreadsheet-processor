import { Injectable } from '@angular/core';

import { APIService } from './api.service';
import { DataMapping, DataMappingFieldName } from '../models/data-mapping';
import { TouchSequence } from 'selenium-webdriver';
import { SubjectSubscriber } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class DataMappingService {
  constructor(private _apiService: APIService) {

  }

  public async getKnownNames(): Promise<Array<string>> {
    try {
      const names = await this._apiService.getData<Array<string>>('/svc/mapping/field-names').toPromise();

      return names;
    } catch (err) {
      return new Array<string>();
    }
  }

  public async getMapping(name): Promise<DataMapping> {
    try {
      const mapping = await this._apiService.getData<DataMapping>(`/svc/mapping/${name}`).toPromise();

      return mapping;
    } catch (err) {
      return new DataMapping();
    }
  }

  public async getMappingNames(): Promise<Array<string>> {
    try {
      const names = await this._apiService.getData<Array<string>>('/svc/mapping/mapping-names').toPromise();

      return names;
    } catch (err) {
      return new Array<string>();
    }
  }

  public async createField(name: string): Promise<boolean> {
    const data = new DataMappingFieldName(name);
    try {
      const success = await this._apiService.postData<DataMappingFieldName, boolean>('/svc/mapping/field-names', data).toPromise();

      return success;
    } catch (err) {
      return false;
    }
  }

  public async createMapping(mapping: DataMapping): Promise<boolean> {
    try {
      const success = await this._apiService.postData<DataMapping, boolean>('/svc/mapping', mapping).toPromise();

      return success;
    } catch (err) {
      return false;
    }
  }

  public async updateMapping(mapping: DataMapping): Promise<boolean> {
    try {
      const updatedMapping = await this._apiService.putData<DataMapping, DataMapping>(`/svc/mapping/${mapping.name}`, mapping).toPromise();
      console.log(updatedMapping);
      return true;
    } catch (err) {
      return false;
    }
  }
}
