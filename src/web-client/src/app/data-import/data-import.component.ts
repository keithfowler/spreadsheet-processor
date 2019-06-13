import { Component, OnInit } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { read, WorkBook, WorkSheet, utils } from 'xlsx';

import { DataMapping, DataMappingPair } from './data-mapping';
import { DataItem, DataProp } from './data-item';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { DataMappingService } from './data-mapping.service';
import { DataAccessService } from './data-access.service';

@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.css']
})
export class DataImportComponent implements OnInit {

  public files: NgxFileDropEntry[];
  public fileName: string;
  public sheets: string[];
  public dataMap: DataMapping;
  public knownFieldsSubject: BehaviorSubject<string[]>;
  public knownFields: Observable<any>;
  public mappingNamesSubject: BehaviorSubject<string[]>;
  public mappingNames: Observable<any>;
  public saveMappingIsDisabled: boolean;
  public isImportingData: boolean;
  public dataTypes: string[];
  public selectedMapping: string;

  private _workBook: WorkBook;
  private _selectedSheetJSON: Array<{}>;

  constructor(private dataMappingSvc: DataMappingService, private dataAccessSvc: DataAccessService) {
    this.files = [];
    this.dataMap = new DataMapping();
    this.sheets = [];
    this.saveMappingIsDisabled = false;
    this.isImportingData = false;
    this.knownFieldsSubject = new BehaviorSubject<string[]>([]);
    this.knownFields = this.knownFieldsSubject.asObservable();
    this.mappingNamesSubject = new BehaviorSubject<string[]>([]);
    this.mappingNames = this.mappingNamesSubject.asObservable();
    this.dataTypes = ['Startup Application', 'Mentor Application'];
    this.selectedMapping = 'Use an exsisting mapping';

    console.log('DataImportComponet constructed');
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Testing

          this.fileName = file.name;

          const reader = new FileReader();
          reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            this._workBook = read(bstr, { type: 'binary', cellDates: true });
            this.sheets = this._workBook.SheetNames;
          };

          reader.readAsBinaryString(file);

          // End Testing

          // Here you can access the real file
          // console.log(droppedFile.relativePath, file);

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public selectSheet(e: any) {
    this.dataMap.mapping = [];
    const ws: WorkSheet = this._workBook.Sheets[this._workBook.SheetNames[e]];
    this._selectedSheetJSON = utils.sheet_to_json(ws);
    const exampleItem = this._selectedSheetJSON[0];

    const sheetKeys = this._getKeys(exampleItem);

    for (const key of sheetKeys) {
      const pair = new DataMappingPair();
      pair.from = key;
      pair.value = exampleItem[key];

      this.dataMap.mapping.push(pair);
    }
  }

  public async createField(name: string) {
    if (!this.knownFieldsSubject.value.includes(name)) {
      this.knownFieldsSubject.value.push(name);
      this.knownFieldsSubject.next(this.knownFieldsSubject.value);

      const createStatus = await this.dataMappingSvc.createField(name);

      console.log(createStatus);
    }
  }

  public toggleFieldFromMap(mapping: DataMappingPair) {
    mapping.isExcluded = !mapping.isExcluded;
  }

  public async mappingSelected() {
    console.log(`selected mapping: ${this.selectedMapping}`);

    if (this.selectedMapping != '' && this.selectedMapping != 'Use an exsisting mapping') {
      const dataMapping = await this.dataMappingSvc.getMapping(this.selectedMapping);

      if (this.dataMap.mapping.length > 0) {
        for (const mapping of this.dataMap.mapping) {
          const itm = dataMapping.mapping.find(function (item) { return item.from == mapping.from; });

          mapping.to = itm.to;
          mapping.isExcluded = itm.isExcluded;
          mapping.mapType = itm.mapType;
        }
      }
    }
  }

  public async saveMapping(name: string) {
    this.saveMappingIsDisabled = true;
    const sanitizedMapping = { name: name, mapping: [] };

    if (name != '' && !this.mappingNamesSubject.value.includes(name)) {
      this.mappingNamesSubject.value.push(name);
      this.mappingNamesSubject.next(this.mappingNamesSubject.value);
      this.selectedMapping = name;

      for (const mapping of this.dataMap.mapping) {
        const item = {
          to: mapping.to,
          from: mapping.from,
          isExcluded: mapping.isExcluded,
          mapType: mapping.mapType
        };

        sanitizedMapping.mapping.push(item);
      }

      const response = await this.dataMappingSvc.createMapping(sanitizedMapping);
    }

    this.saveMappingIsDisabled = false;
  }

  public async saveData(type: string) {
    this.isImportingData = true;

    const success = await this.importData(type);

    if (!success) {
      // TODO: display error notifcation
    }

    this.isImportingData = false;
  }

  public async importData(type: string): Promise<boolean> {
    const svcData: Array<DataItem> = [];

    for (const item of this._selectedSheetJSON) {
      const dataItem = new DataItem(type);
      dataItem.props.push(this._parseData(item));

      svcData.push(dataItem);
    }

    const response = await this.dataAccessSvc.add(svcData);

    return response;
  }

  public async ngOnInit() {
    const knownNames = await this.dataMappingSvc.getKnownNames();
    this.knownFieldsSubject.next(knownNames);

    const mappingNames = await this.dataMappingSvc.getMappingNames();
    this.mappingNamesSubject.next(mappingNames);
  }

  private _getKeys(item: any) {
    return Object.keys(item);
  }

  private _parseData(item: {}): DataProp {
    const dataProp: DataProp = new DataProp();

    for (const mapping of this.dataMap.mapping) {
      if (!mapping.isExcluded) {
        const dataItem = item[mapping.from];

        switch (mapping.mapType) {
          case 'number':
            const intParsed = parseInt(dataItem, 10);
            dataProp.inputData[mapping.to] = intParsed.toString() == 'NaN' ? dataItem : intParsed;
            break;
          case 'date/time':
            const dtParsed = new Date(Date.parse(dataItem));
            console.log(`not a date?? ${dtParsed.toString()}`);
            dataProp.inputData[mapping.to] = dtParsed.toString() == 'Invalid Date' ? dataItem : dtParsed;
            break;
          default:
            dataProp.inputData[mapping.to] = dataItem;
            break;
        }
      }
    }

    return dataProp;
  }
}
