
export interface IFileItem {
  input: string;
  fileName: string;
  path: string;
  type: string;
  typeInfo?: IGenTypeInfo;
  active: boolean;
  importToModue?: string;
  importToRouting?: string;
  tsContent?: string;
  specContent?: string;
  htmlContent?: string;
  styleContent?: string;
}

export interface IGenTypeInfo {
  ts: boolean;
  html?: boolean;
  style?: boolean;
  styleType?: string;
  spec?: boolean;
  importToModue?: boolean;
  importToRouting?: boolean;
}

export interface IGenType {
  [key: string]: IGenTypeInfo;
}

export const TYPES: IGenType = {
  'module': { ts: true, spec: true, importToModue: true, importToRouting: true },
  'component': { ts: true, html: true, style: true, styleType: "less", spec: true, importToModue: true, importToRouting: true },
  'service': { ts: true, spec: true, importToModue: true },
  'directive': { ts: true, spec: true, importToModue: true },
  'pipe': { ts: true, spec: true, importToModue: true },
  'class': { ts: true, spec: true },
  'guard': { ts: true, spec: true },
  'interface': { ts: true },
  'enum': { ts: true }
};

export const STYLES = ['css', 'less', 'sass'];

export const VARS = [
  'input', 'prefix',
  'fileName', 'type', 'path', 'styleType', 'importToModue', 'importToRouting',
  'curPath', 'curFile', 'workspaceRoot'
];

export function GetDefaultFile(): IFileItem {
  let type = 'class';
  let typeInfo = Object.assign({}, TYPES[type]);
  return {
    input: '',
    fileName: '',
    path: '',
    type: type,
    typeInfo: typeInfo,
    importToModue: '',
    active: false,
    tsContent: '',
    specContent: '',
    htmlContent: '',
    styleContent: ''
  }
}

export function CloneFile(file: IFileItem): IFileItem {
  let fileTemp = Object.assign({}, file);
  fileTemp.typeInfo && (fileTemp.typeInfo = Object.assign({}, fileTemp.typeInfo));
  return fileTemp;
};

export function JoinPath(path: string, fileName: string): string {
  return [path.trim(), fileName.trim()].join(_pathSplice).replace(/[\\\/]{1,}/g, _pathSplice).replace(/^[\/\\]/, '');
}

export function GetFileFullName(file: IFileItem): string {
  let type = file.type;
  let typeInfo = file.typeInfo;
  let exts = [];
  typeInfo.ts && exts.push('ts');
  typeInfo.spec && exts.push('spec');
  typeInfo.html && exts.push('html');
  typeInfo.style && exts.push(typeInfo.styleType);
  let name = [file.fileName.trim(), exts.join(' | ')].join('.').replace(/[.]{2,}/g, '.');

  let fullName = JoinPath(file.path, name);
  return GetVar(file, fullName);
}

export function GetFileFullNameList(file: IFileItem): string[] {
  let type = file.type;
  let typeInfo = file.typeInfo;
  let fileList: string[] = [];
  let fileName = GetVar(file, JoinPath(file.path, file.fileName));
  typeInfo.ts && fileList.push([fileName, 'ts'].join('.'));
  typeInfo.spec && fileList.push([fileName, 'spec'].join('.'));
  typeInfo.html && fileList.push([fileName, 'html'].join('.'));
  typeInfo.style && fileList.push([fileName, typeInfo.styleType || 'css'].join('.'));
  return fileList;
}

export function GetFileFullList(file: IFileItem): { fileName: string, content: string }[] {
  let type = file.type;
  let typeInfo = file.typeInfo;
  let fileList = [];
  let fileName = GetVar(file, JoinPath(file.path, file.fileName));
  if (typeInfo.ts) {
    fileList.push({
      fileName: [fileName, 'ts'].join('.'),
      content: GetVar(file, file.tsContent)
    });
  }
  if (typeInfo.spec) {
    fileList.push({
      fileName: [fileName, 'spec'].join('.'),
      content: GetVar(file, file.specContent)
    });
  }
  if (typeInfo.html) {
    fileList.push({
      fileName: [fileName, 'html'].join('.'),
      content: GetVar(file, file.htmlContent)
    });
  }
  if (typeInfo.style) {
    fileList.push({
      fileName: [fileName, typeInfo.styleType || 'css'].join('.'),
      content: GetVar(file, file.styleContent)
    });
  }
  return fileList;
}

const _varFindRegex = /\@\{\s*#*\s*([^\}]+)\s*\}/gi;
export function GetVar(file: IFileItem, value: string): string {
  if (!value) return "";
  _varFindRegex.lastIndex = 0;
  if (!_varFindRegex.test(value)) return value;
  _varFindRegex.lastIndex = 0;
  value = value.replace(_varFindRegex, function (find, name) {
    var text = '';
    if (name == 'styleType') {
      text = file.typeInfo.styleType;
    } else
      text = GetVarProp(file, name);
    text = GetVar(file, text);
    return find.indexOf('#') >= 0 ? MakePascalCasingName(text) : text;
  });

  return value;
}

let _pathSplice = '/';
function GetVarProp(file: IFileItem, prop: string): string {
  let str: string;
  if (prop in file)
    str = file[prop];
  else if (prop in _varObj)
    str = _varObj[prop];
  return str ? str.replace('{' + prop + '}', '') : '';
}

let _varObj: object = {};
export function SetVarObject(obj: object) {
  _varObj = Object.assign(_varObj, obj);
  _pathSplice = _varObj['isLinux'] ? '/' : '\\';
};

/**
 * 名称转换：sip-user_list.component ===> SipUserListComponent
 * @param name 
 */
export function MakePascalCasingName(name: string) {
  _varFindRegex.lastIndex = 0;
  if (_varFindRegex.test(name)) return name;
  return name.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase(); }).replace(/[^a-z0-9]/gi, '');
}

export interface IVscodeOption {
  curPath?: string;
  curFile?: string;
  isDir?: boolean;
  isLinux?: boolean;
  input?: string;
  prefix?: string;
  fileName?: string;
  workspaceRoot?: string;
  extensionPath?: string;
  modules: string[];
}

export interface ITmplItem {
  title: string;
  active?: boolean;
  files: IFileItem[];
}

export interface IConfig {
  prefix?: string;
  tmpls?: ITmplItem[];
}

export function GetDefaultTmpl(): ITmplItem {
  return { title: '', active: false, files: [] };
}

export const DEFAULT_TMPLS = [{ "title": "class", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "", "type": "class", "typeInfo": { "ts": true, "spec": true }, "importToModue": "", "active": true, "tsContent": "export class @{#fileName} {\n}\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  it('should create an instance', () => {\n    expect(new @{#fileName}()).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "component", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "@{input}", "type": "component", "typeInfo": { "ts": true, "html": true, "style": true, "styleType": "less", "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "import { Component, OnInit } from '@angular/core';\n\n@Component({\n  selector: '@{prefix}-@{input}',\n  templateUrl: './@{fileName}.html',\n  styleUrls: ['./@{fileName}.@{styleType}']\n})\nexport class @{#fileName} implements OnInit {\n\n  constructor() { }\n\n  ngOnInit() {\n  }\n\n}\n", "specContent": "import { async, ComponentFixture, TestBed } from '@angular/core/testing';\n\nimport { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  let component: @{#fileName};\n  let fixture: ComponentFixture<@{#fileName}>;\n\n  beforeEach(async(() => {\n    TestBed.configureTestingModule({\n      declarations: [ @{#fileName}]\n    })\n    .compileComponents();\n  }));\n\n  beforeEach(() => {\n    fixture = TestBed.createComponent(AaaaComponent);\n    component = fixture.componentInstance;\n    fixture.detectChanges();\n  });\n\n  it('should create', () => {\n    expect(component).toBeTruthy();\n  });\n});\n", "htmlContent": "<p>\n  aaaa works!\n</p>\n", "styleContent": "" }], "active": false }, { "title": "directive", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "", "type": "directive", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "@Directive({\n  selector: '[@{prefix}@{#input}]'\n})\nexport class @{#fileName} {\n\n  constructor() { }\n\n}\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  it('should create an instance', () => {\n    const directive = new @{#fileName}();\n    expect(directive).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "enum", "files": [{ "input": "demo", "fileName": "@{input}", "path": "", "type": "enum", "typeInfo": { "ts": true }, "importToModue": "", "active": true, "tsContent": "export enum @{#fileName} {\n}\n", "specContent": "", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "guard", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "", "type": "guard", "typeInfo": { "ts": true, "spec": true }, "importToModue": "", "active": true, "tsContent": "import { Injectable } from '@angular/core';\nimport { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';\nimport { Observable } from 'rxjs';\n\n@Injectable()\nexport class @{#fileName} implements CanActivate {\n  canActivate(\n    next: ActivatedRouteSnapshot,\n    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {\n    return true;\n  }\n}\n", "specContent": "import { TestBed, async, inject } from '@angular/core/testing';\n\nimport { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  beforeEach(() => {\n    TestBed.configureTestingModule({\n      providers: [@{#fileName}]\n    });\n  });\n\n  it('should ...', inject([@{#fileName}], (guard: @{#fileName}) => {\n    expect(guard).toBeTruthy();\n  }));\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "interface", "files": [{ "input": "demo", "fileName": "@{input}", "path": "", "type": "interface", "typeInfo": { "ts": true }, "importToModue": "", "active": true, "tsContent": "export interface @{#fileName} {\n}\n\n", "specContent": "", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "module", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "@{input}", "type": "module", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "import { NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@NgModule({\n  imports: [\n    CommonModule\n  ],\n  declarations: []\n})\nexport class @{#fileName} { }\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  let testModule: @{#fileName};\n\n  beforeEach(() => {\n    testModule = new @{#fileName}();\n  });\n\n  it('should create an instance', () => {\n    expect(testModule).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "routing", "files": [{ "input": "demo", "fileName": "@{input}-routing.@{type}", "path": "@{input}", "type": "module", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "import { NgModule } from '@angular/core';\nimport { Routes, RouterModule } from '@angular/router';\n\nconst routes: Routes = [];\n\n@NgModule({\n  imports: [RouterModule.forChild(routes)],\n  exports: [RouterModule]\n})\nexport class @{#fileName} { }\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  let testRoutingModule: @{#fileName};\n\n  beforeEach(() => {\n    testRoutingModule = new @{#fileName}();\n  });\n\n  it('should create an instance', () => {\n    expect(testRoutingModule).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "pipe", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "", "type": "pipe", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "import { Pipe, PipeTransform } from '@angular/core';\n\n@Pipe({\n  name: '@{input}'\n})\nexport class @{#fileName} implements PipeTransform {\n\n  transform(value: any, args?: any): any {\n    return null;\n  }\n\n}\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  it('create an instance', () => {\n    const pipe = new @{#fileName}();\n    expect(pipe).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "service", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "", "type": "service", "typeInfo": { "ts": true, "spec": true, "importToModue": true }, "importToModue": "", "active": true, "tsContent": "import { Injectable } from '@angular/core';\n\n@Injectable({\n  providedIn: 'root'\n})\nexport class @{#fileName} {\n\n  constructor() { }\n}\n", "specContent": "import { TestBed, inject } from '@angular/core/testing';\n\nimport { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  beforeEach(() => {\n    TestBed.configureTestingModule({\n      providers: [@{#fileName}]\n    });\n  });\n\n  it('should be created', inject([@{#fileName}], (service: @{#fileName}) => {\n    expect(service).toBeTruthy();\n  }));\n});", "htmlContent": "", "styleContent": "" }], "active": false }, { "title": "module & routing", "files": [{ "input": "demo", "fileName": "@{input}.@{type}", "path": "@{input}", "type": "module", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": true, "tsContent": "import { NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\nimport { @{#input}RoutingModule } from './${input}-routing.module';\n\n@NgModule({\n  imports: [\n    CommonModule,\n    @{#input}RoutingModule\n  ],\n  declarations: []\n})\nexport class @{#fileName} { }\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  let testModule: @{#fileName};\n\n  beforeEach(() => {\n    testModule = new @{#fileName}();\n  });\n\n  it('should create an instance', () => {\n    expect(testModule).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }, { "input": "demo", "fileName": "@{input}-routing.@{type}", "path": "@{input}", "type": "module", "typeInfo": { "ts": true, "spec": true, "importToModue": true, "importToRouting": true }, "importToModue": "", "active": false, "tsContent": "import { NgModule } from '@angular/core';\nimport { Routes, RouterModule } from '@angular/router';\n\nconst routes: Routes = [];\n\n@NgModule({\n  imports: [RouterModule.forChild(routes)],\n  exports: [RouterModule]\n})\nexport class @{#fileName} { }\n", "specContent": "import { @{#fileName} } from './@{fileName}';\n\ndescribe('@{#fileName}', () => {\n  let testRoutingModule: @{#fileName};\n\n  beforeEach(() => {\n    testRoutingModule = new @{#fileName}();\n  });\n\n  it('should create an instance', () => {\n    expect(testRoutingModule).toBeTruthy();\n  });\n});\n", "htmlContent": "", "styleContent": "" }], "active": true }];

export function CloneTmpl(tmpl: ITmplItem): ITmplItem {
  let tmplTemp = Object.assign({}, tmpl);
  tmplTemp.files = tmplTemp.files.slice().map((p) => {
    return CloneFile(p);
  });
  return tmplTemp;
}