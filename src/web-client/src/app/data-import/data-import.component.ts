import { Component, OnInit } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { read as xlsxRead, WorkBook, WorkSheet, utils as xlsxUtils } from 'xlsx';

import { DataMapping, DataMappingPair } from '../models/data-mapping';
import { DataItem, DataProp } from '../models/data-item';
import { DataType } from '../models/data-type';
import { Observable, BehaviorSubject } from 'rxjs';
import { DataMappingService } from '../services/data-mapping.service';
import { DataAccessService } from '../services/data-access.service';
import { NotificationService } from '../services/notification.service';

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
  public saveDataTypeIsDisabled: boolean;
  public isImportingData: boolean;
  public dataTypes: DataType[];
  public selectedMapping: string;

  private _workBook: WorkBook;
  private _selectedSheetJSON: Array<{}>;

  constructor(private _dataMappingSvc: DataMappingService, private _dataAccessSvc: DataAccessService, private _notificationSvc: NotificationService) {
    this.saveMappingIsDisabled = false;
    this.saveDataTypeIsDisabled = false;
    this.isImportingData = false;
    this.files = [];
    this.sheets = [];
    this.knownFieldsSubject = new BehaviorSubject<string[]>([]);
    this.mappingNamesSubject = new BehaviorSubject<string[]>([]);
    this.knownFields = this.knownFieldsSubject.asObservable();
    this.mappingNames = this.mappingNamesSubject.asObservable();
    this.dataMap = new DataMapping();
    this.selectedMapping = 'Use an exsisting mapping';
  }

  public async ngOnInit() {
    this.dataTypes = await this._dataAccessSvc.getTypes();

    const knownNames = await this._dataMappingSvc.getKnownNames();
    this.knownFieldsSubject.next(knownNames);

    const mappingNames = await this._dataMappingSvc.getMappingNames();
    this.mappingNamesSubject.next(mappingNames);
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.fileName = file.name;
          const reader = new FileReader();

          reader.onload = (e: any) => {
            try {
              const bstr: string = e.target.result;
              this._workBook = xlsxRead(bstr, { type: 'binary', cellDates: true });
              this.sheets = this._workBook.SheetNames;
            } catch (err) {
              this._notificationSvc.addNotification(`${this.fileName} does not appear to be a spreadsheet`, true);
            }
          };

          reader.readAsBinaryString(file);
        });
      } else {
        this._notificationSvc.addNotification('only files can be uploaded, not folders', true);
      }
    }
  }

  public selectSheet(index: number) {
    this.dataMap.mapping = [];
    const ws: WorkSheet = this._workBook.Sheets[this._workBook.SheetNames[index]];
    this._selectedSheetJSON = xlsxUtils.sheet_to_json(ws);
    const sheetItem = this._selectedSheetJSON[0];
    const sheetKeys = Object.keys(sheetItem);

    for (const key of sheetKeys) {
      const pair = new DataMappingPair();
      pair.from = key;
      pair.value = sheetItem[key];

      this.dataMap.mapping.push(pair);
    }
  }

  public async createField(name: string) {
    if (!this.knownFieldsSubject.value.includes(name)) {
      this.knownFieldsSubject.value.push(name);
      this.knownFieldsSubject.next(this.knownFieldsSubject.value);

      const createStatus = await this._dataMappingSvc.createField(name);

      if (createStatus) {
        this._notificationSvc.addNotification(`field ${name} created successfully`, false);
      } else {
        this._notificationSvc.addNotification(`error creating field ${name}`, true);
      }
    }
  }

  public toggleFieldFromMap(mapping: DataMappingPair) {
    mapping.isExcluded = !mapping.isExcluded;
  }

  public async mappingSelected() {
    if (this.selectedMapping != '' && this.selectedMapping != 'Use an exsisting mapping') {
      const dataMapping = await this._dataMappingSvc.getMapping(this.selectedMapping);

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

  public async createDataType(name: string): Promise<void> {
    this.saveDataTypeIsDisabled = true;
    const dataType = await this._dataAccessSvc.createType(name);
    const notificationMsg = { msg: '', success: false };

    if (dataType !== null) {
      notificationMsg.msg = `Successfully created name: ${name}`;
      notificationMsg.success = true;
      const dType = new DataType();
      dType.displayName = name;
      dType.value = dataType;

      this.dataTypes.push(dType);
    } else {
      notificationMsg.msg = `Could not create ${name} name. Please try again later`;
      notificationMsg.success = false;
    }

    this._notificationSvc.addNotification(notificationMsg.msg, !notificationMsg.success);
    this.saveDataTypeIsDisabled = false;
  }

  public async saveMapping(name: string): Promise<void> {
    this.saveMappingIsDisabled = true;
    const sanitizedMapping = { name: name, mapping: [] };
    let notificationMsg = { msg: '', success: false };

    for (const mapping of this.dataMap.mapping) {
      const item = {
        to: mapping.to,
        from: mapping.from,
        isExcluded: mapping.isExcluded,
        mapType: mapping.mapType
      };

      sanitizedMapping.mapping.push(item);
    }

    if (name != '' && !this.mappingNamesSubject.value.includes(name)) {
      this.mappingNamesSubject.value.push(name);
      this.mappingNamesSubject.next(this.mappingNamesSubject.value);
      this.selectedMapping = name;

      const response = await this._dataMappingSvc.createMapping(sanitizedMapping);
      if (response) {
        notificationMsg.msg = `successfully created mapping ${name}`;
        notificationMsg.success = true;
      } else {
        notificationMsg.msg = `error creating mapping ${name}`;
      }
    } else {
      const response = await this._dataMappingSvc.updateMapping(sanitizedMapping);
      if (response) {
        notificationMsg.msg = `successfully updated mapping ${name}`;
        notificationMsg.success = true;
      } else {
        notificationMsg.msg = `error updating mapping ${name}`;
      }
    }

    this._notificationSvc.addNotification(notificationMsg.msg, !notificationMsg.success);

    this.saveMappingIsDisabled = false;
  }

  public async saveData(type: string) {
    this.isImportingData = true;

    const success = await this.importData(type);

    if (success) {
      this._notificationSvc.addNotification('successfully imported spreadsheet', false);
    } else {
      this._notificationSvc.addNotification('error importing spreadsheet', true);
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

    const response = await this._dataAccessSvc.add(svcData);

    return response;
  }

  private _parseData(item: {}): DataProp {
    const dataProp: DataProp = new DataProp();

    for (const mapping of this.dataMap.mapping) {
      if (!mapping.isExcluded) {
        const dataItem = item[mapping.from];
        const fieldName = mapping.to === '' || mapping.to === undefined ? mapping.from : mapping.to;

        switch (mapping.mapType) {
          case 'number':
            const intParsed = parseInt(dataItem, 10);
            dataProp.inputData[fieldName] = intParsed.toString() == 'NaN' ? dataItem : intParsed;
            break;
          case 'date/time':
            const dtParsed = new Date(Date.parse(dataItem));
            dataProp.inputData[fieldName] = dtParsed.toString() == 'Invalid Date' ? dataItem : dtParsed;
            break;
          default:
            dataProp.inputData[fieldName] = dataItem;
            break;
        }
      }
    }

    return dataProp;
  }
}
