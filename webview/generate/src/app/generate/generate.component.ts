import { Component, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, merge } from 'rxjs/operators';
import { IFileItem, IGenTypeInfo, ITmplItem, VARS, getFileFullName } from '../core/lib';
import { GenerateTmplService } from '../core/services/generate-tmpl.service';
import { GenerateService } from '../core/services/generate.service';
import { VscodeMessageService } from '../core/services/vscode-message.service';
@Component({
  selector: 'sip-generate',
  templateUrl: './generate.component.html',
  styles: []
})
export class GenerateComponent {

  constructor(public genSrv: GenerateService,
    private _genTmplSrv: GenerateTmplService,
    private _vsMsg: VscodeMessageService) {
  }

  vars: string = VARS.join(', ');
  editContentType = 0;

  get styleList(): string[] {
    return this.genSrv.styleList;
  }

  log(p: any) {
    console.log(p);
  }

  get typeList(): any[] {
    return this.genSrv.typeList;
  }

  get curTypeInfo(): IGenTypeInfo {
    return this.genSrv.curTypeInfo;
  }

  get files(): IFileItem[] {
    return this.genSrv.files;
  };

  get hasFile(): boolean {
    return this.files && this.files.length > 0;
  }

  get curFile(): IFileItem {
    return this.genSrv.curFile;
  };

  public get input(): string {
    return this._vsMsg.input;
  }
  public set input(p: string) {
    this._vsMsg.input = p;
  }

  public get prefix(): string {
    return this._vsMsg.prefix;
  }
  public set prefix(p: string) {
    this._vsMsg.prefix = p;
  }

  getFileFullName(file: IFileItem) {
    file.input = this.input;
    return getFileFullName(file);
  }

  activeFice(file: IFileItem) {
    let hasContentType = true;
    switch (this.editContentType) {
      case 1:
        hasContentType = file.typeInfo.ts;
        break;
      case 2:
        hasContentType = file.typeInfo.spec;
        break;
      case 3:
        hasContentType = file.typeInfo.html;
        break;
      case 4:
        hasContentType = file.typeInfo.style;
        break;
    }
    if (!hasContentType) this.editContentType = 0;
    return this.genSrv.activeFile(file);
  }

  changeType() {
    this.genSrv.changeType();
  }


  add() {
    let index = ~~this.tmplIndex;
    let tmpl = this.tmpls[index];
    if (tmpl)
      this.genSrv.addFromTmpl(tmpl);
  }

  showFormType = 'list';

  remove(file: IFileItem) {
    this.genSrv.remove(file);
  }

  removeAll() {
    this.genSrv.removeAll();
  }

  tmplIndex: string = "0";
  get tmpls(): ITmplItem[] {
    return this._genTmplSrv.tmpls;
  }

  tmplTitle = "";
  saveToTmpl() {
    this.genSrv.saveToTmpl(this.tmplTitle);
    this.showFormType = 'list';
  }

  @ViewChild('instImportM') instImportM: NgbTypeahead;
  focusImportM = new Subject<string>();
  clickImportM = new Subject<string>();
  searchImportM = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      merge(this.focusImportM),
      merge(this.clickImportM.pipe(filter(() => !this.instImportM.isPopupOpen()))),
      map(term => (term === '' ? states
        : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );


  @ViewChild('instImportM') instImportR: NgbTypeahead;
  focusImportR = new Subject<string>();
  clickImportR = new Subject<string>();
  searchImportR = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      merge(this.focusImportR),
      merge(this.clickImportR.pipe(filter(() => !this.instImportR.isPopupOpen()))),
      map(term => (term === '' ? states
        : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
}

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
  'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];