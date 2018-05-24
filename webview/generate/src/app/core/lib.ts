
export interface IFileItem {
    input: string;
    fileName: string;
    path: string;
    type: string;
    className: string;
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
    moduleExport?: boolean;
    moduleImport?: boolean;
    moduleDeclaration?: boolean;
    moduleEntryComponent?: boolean;
    moduleProvider?: boolean;
}

export interface IGenType {
    [key: string]: IGenTypeInfo;
}

export const TYPES: IGenType = {
    'module': {
        ts: true, spec: true, importToModue: true, importToRouting: true,
        moduleExport: true, moduleImport: true
    },
    'component': {
        ts: true, html: true, style: true, styleType: "less", spec: true,
        importToModue: true, importToRouting: true,
        moduleDeclaration: true, moduleEntryComponent: true, moduleExport: true
    },
    'service': { ts: true, spec: true, importToModue: true, moduleProvider: true },
    'directive': { ts: true, spec: true, importToModue: true, moduleDeclaration: true, moduleExport: true },
    'pipe': { ts: true, spec: true, importToModue: true, moduleDeclaration: true, moduleExport: true },
    'class': { ts: true, spec: true },
    'guard': { ts: true, spec: true },
    'interface': { ts: true },
    'enum': { ts: true }
};

export const STYLES = ['css', 'less', 'sass'];

export const VARS = [
    'input', 'prefix',
    'fileName', 'type', 'path', 'className', 'styleType', 'importToModue', 'importToRouting',
    'curPath', 'curFile', 'workspaceRoot'
];

export function GetDefaultFile(): IFileItem {
    let type = 'class';
    let typeInfo = Object.assign({}, TYPES[type]);
    return {
        input: '',
        fileName: '',
        path: '',
        className: '',
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
        let isImportToModue = file.typeInfo.importToModue;
        let isImportToRouting = file.typeInfo.importToRouting;
        fileList.push({
            fileName: [fileName, 'ts'].join('.'),
            content: GetVar(file, file.tsContent),
            className: file.className ? GetVar(file, file.className) : '',
            isModule: file.type == 'module',
            isImportToModue: file.typeInfo.importToModue,
            importToModue: file.importToModue ? GetVar(file, file.importToModue) : '',
            isImportToRouting: file.typeInfo.importToRouting,
            importToRouting: file.importToRouting ? GetVar(file, file.importToRouting) : '',
            routePath: GetVar(file, '@{input}'),
            typeInfo: Object.assign({}, file.typeInfo)
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

export function CloneTmpl(tmpl: ITmplItem): ITmplItem {
    let tmplTemp = Object.assign({}, tmpl);
    tmplTemp.files = tmplTemp.files.slice().map((p) => {
        return CloneFile(p);
    });
    return tmplTemp;
}

export const DEFAULT_TMPLS: ITmplItem[] = [
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "<p>\n  aaaa works!\n</p>\n",
                "importToModue": "",
                "input": "demo",
                "path": "@{input}",
                "className": "@{#fileName}",
                "specContent": "import { async, ComponentFixture, TestBed } from '@angular/core/testing';\n\nimport { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  let component: @{className};\n  let fixture: ComponentFixture<@{className}>;\n\n  beforeEach(async(() => {\n    TestBed.configureTestingModule({\n      declarations: [ @{className}]\n    })\n    .compileComponents();\n  }));\n\n  beforeEach(() => {\n    fixture = TestBed.createComponent(AaaaComponent);\n    component = fixture.componentInstance;\n    fixture.detectChanges();\n  });\n\n  it('should create', () => {\n    expect(component).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { Component, OnInit } from '@angular/core';\n\n@Component({\n  selector: '@{prefix}-@{input}',\n  templateUrl: './@{fileName}.html',\n  styleUrls: ['./@{fileName}.@{styleType}']\n})\nexport class @{className} implements OnInit {\n\n  constructor() { }\n\n  ngOnInit() {\n  }\n\n}\n",
                "type": "component",
                "typeInfo": {
                    "html": true,
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleDeclaration": true,
                    "spec": true,
                    "style": true,
                    "styleType": "less",
                    "ts": true
                }
            }
        ],
        "title": "component"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "import { TestBed, inject } from '@angular/core/testing';\n\nimport { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  beforeEach(() => {\n    TestBed.configureTestingModule({\n      providers: [@{className}]\n    });\n  });\n\n  it('should be created', inject([@{className}], (service: @{className}) => {\n    expect(service).toBeTruthy();\n  }));\n});",
                "styleContent": "",
                "tsContent": "import { Injectable } from '@angular/core';\n\n@Injectable({\n  providedIn: 'root'\n})\nexport class @{className} {\n\n  constructor() { }\n}\n",
                "type": "service",
                "typeInfo": {
                    "importToModue": true,
                    "moduleProvider": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "service"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "@{input}",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  let testModule: @{className};\n\n  beforeEach(() => {\n    testModule = new @{className}();\n  });\n\n  it('should create an instance', () => {\n    expect(testModule).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n@NgModule({\n  imports: [\n    CommonModule\n  ],\n  declarations: []\n})\nexport class @{className} { }\n",
                "type": "module",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleImport": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "module"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}-routing.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "@{input}",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  let testRoutingModule: @{className};\n\n  beforeEach(() => {\n    testRoutingModule = new @{className}();\n  });\n\n  it('should create an instance', () => {\n    expect(testRoutingModule).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { NgModule } from '@angular/core';\nimport { Routes, RouterModule } from '@angular/router';\n\nconst routes: Routes = [];\n\n@NgModule({\n  imports: [RouterModule.forChild(routes)],\n  exports: [RouterModule]\n})\nexport class @{className} { }\n",
                "type": "module",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleImport": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "routing"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "@{input}",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  let testModule: @{className};\n\n  beforeEach(() => {\n    testModule = new @{className}();\n  });\n\n  it('should create an instance', () => {\n    expect(testModule).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\nimport { @{#input}RoutingModule } from './${input}-routing.module';\n\n@NgModule({\n  imports: [\n    CommonModule,\n    @{#input}RoutingModule\n  ],\n  declarations: []\n})\nexport class @{className} { }\n",
                "type": "module",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleImport": true,
                    "spec": true,
                    "ts": true
                }
            },
            {
                "active": false,
                "fileName": "@{input}-routing.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "@{input}",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  let testRoutingModule: @{className};\n\n  beforeEach(() => {\n    testRoutingModule = new @{className}();\n  });\n\n  it('should create an instance', () => {\n    expect(testRoutingModule).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { NgModule } from '@angular/core';\nimport { Routes, RouterModule } from '@angular/router';\n\nconst routes: Routes = [];\n\n@NgModule({\n  imports: [RouterModule.forChild(routes)],\n  exports: [RouterModule]\n})\nexport class @{className} { }\n",
                "type": "module",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleImport": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "module & routing"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  it('should create an instance', () => {\n    const directive = new @{className}();\n    expect(directive).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "@Directive({\n  selector: '[@{prefix}@{#input}]'\n})\nexport class @{className} {\n\n  constructor() { }\n\n}\n",
                "type": "directive",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleDeclaration": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "directive"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  it('create an instance', () => {\n    const pipe = new @{className}();\n    expect(pipe).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "import { Pipe, PipeTransform } from '@angular/core';\n\n@Pipe({\n  name: '@{input}'\n})\nexport class @{className} implements PipeTransform {\n\n  transform(value: any, args?: any): any {\n    return null;\n  }\n\n}\n",
                "type": "pipe",
                "typeInfo": {
                    "importToModue": true,
                    "importToRouting": true,
                    "moduleDeclaration": true,
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "pipe"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "import { TestBed, async, inject } from '@angular/core/testing';\n\nimport { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  beforeEach(() => {\n    TestBed.configureTestingModule({\n      providers: [@{className}]\n    });\n  });\n\n  it('should ...', inject([@{className}], (guard: @{className}) => {\n    expect(guard).toBeTruthy();\n  }));\n});\n",
                "styleContent": "",
                "tsContent": "import { Injectable } from '@angular/core';\nimport { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';\nimport { Observable } from 'rxjs';\n\n@Injectable()\nexport class @{className} implements CanActivate {\n  canActivate(\n    next: ActivatedRouteSnapshot,\n    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {\n    return true;\n  }\n}\n",
                "type": "guard",
                "typeInfo": {
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "guard"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "",
                "styleContent": "",
                "tsContent": "export interface @{className} {\n}\n\n",
                "type": "interface",
                "typeInfo": {
                    "ts": true
                }
            }
        ],
        "title": "interface"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}.@{type}",
                "htmlContent": "",
                "importToModue": "",
                "input": "list",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "import { @{className} } from './@{fileName}';\n\ndescribe('@{className}', () => {\n  it('should create an instance', () => {\n    expect(new @{className}()).toBeTruthy();\n  });\n});\n",
                "styleContent": "",
                "tsContent": "export class @{className} {\n}\n",
                "type": "class",
                "typeInfo": {
                    "spec": true,
                    "ts": true
                }
            }
        ],
        "title": "class"
    },
    {
        "active": false,
        "files": [
            {
                "active": true,
                "fileName": "@{input}",
                "htmlContent": "",
                "importToModue": "",
                "input": "demo",
                "path": "",
                "className": "@{#fileName}",
                "specContent": "",
                "styleContent": "",
                "tsContent": "export enum @{className} {\n}\n",
                "type": "enum",
                "typeInfo": {
                    "ts": true
                }
            }
        ],
        "title": "enum"
    }
];
