import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { DataMapping, DataMappingFieldName } from './data-mapping';

@Injectable({
  providedIn: 'root'
})
export class DataMappingService {
  private _httpOptions: {};

  constructor(private http: HttpClient) {
    this._httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  public async getKnownNames(): Promise<Array<string>> {
    try {
      const names = await this.http.get<Array<string>>('/svc/mapping/field-names').toPromise();

      return names;
    } catch (err) {
      return new Array<string>();
    }
  }

  public async getMapping(name): Promise<DataMapping> {
    try {
      const mapping = await this.http.get<DataMapping>(`/svc/mapping/${name}`).toPromise();

      return mapping;
    } catch (err) {
      console.log(err);
      return new DataMapping();
    }
  }

  public async getMappingNames(): Promise<Array<string>> {
    try {
      const names = await this.http.get<Array<string>>('/svc/mapping/mapping-names').toPromise();
      console.log(`mapping names: ${names}`);
      return names;
    } catch (err) {
      return new Array<string>();
    }
  }

  public async createField(name: string): Promise<boolean> {
    const data = new DataMappingFieldName(name);
    try {
      const response = await this.http.post<DataMappingFieldName>('/svc/mapping/field-names', data, this._httpOptions).toPromise();
      console.log(response);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async createMapping(mapping: DataMapping): Promise<boolean> {
    console.log('before svc call');

    try {
      const response = await this.http.post<DataMapping>(`/svc/mapping`, mapping, this._httpOptions).toPromise();
      console.log(response);

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }

  public updateMapping(id) {

  }
}
