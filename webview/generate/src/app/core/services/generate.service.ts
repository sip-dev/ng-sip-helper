import { Injectable } from '@angular/core';
import { IFileItem, IGenTypeInfo, STYLES, TYPES, getDefaultFile } from '../lib';
import { GenerateTmplService } from './generate-tmpl.service';

@Injectable()
export class GenerateService {

    constructor(private _genTmplSrv: GenerateTmplService) {
        let typeList = [];
        Object.keys(TYPES).forEach((p) => {
            typeList.push(p);
        });
        this.typeList = typeList;
        this.activeFile(this.files[0]);
    }

    styleList = STYLES;

    typeList: any[];
    curTypeInfo: IGenTypeInfo;

    files: IFileItem[] = [{
        input: 'user',
        fileName: '{input}-list.{type}',
        path: '{input}-list',
        type: 'component',
        typeInfo: { ts: true, spec: true, html: true, style: true, styleType: "less" },
        importToModue: 'user.module',
        importToRouting: 'user-routing.module',
        active: false
    },
    {
        input: 'user',
        fileName: '{input}-form.{type}',
        path: '{input}-form',
        type: 'component',
        typeInfo: { ts: true, spec: true, html: true, style: true, styleType: "less" },
        importToModue: 'user.module',
        importToRouting: 'user-routing.module',
        active: false
    },
    {
        input: 'user',
        fileName: '{input}.{type}',
        path: '',
        type: 'module',
        typeInfo: { ts: true, spec: true },
        importToModue: '../app.module',
        importToRouting: 'user-routing.module',
        active: false
    }];

    curFile: IFileItem;

    activeFile(file: IFileItem) {
        this.curFile = file || getDefaultFile();
        if (!file) return;
        this.files.forEach((p) => {
            p.active = (p == file);
        });
        this.curTypeInfo = TYPES[file.type];
    }

    changeType() {
        let file = this.curFile;
        this.curTypeInfo = TYPES[file.type];
        file.typeInfo = Object.assign({}, this.curTypeInfo);
    }

    add(addFileItem: IFileItem): IFileItem {
        let type = addFileItem.type;
        let typeInfo = Object.assign({}, TYPES[addFileItem.type]);
        let file: IFileItem = {
            input: addFileItem.input,
            fileName: '{input}.{type}',
            path: '{fileName}',
            type: type,
            typeInfo: typeInfo,
            importToModue: '',
            active: false,
            tsContent: '',
            specContent: '',
            htmlContent: '',
            styleContent: ''
        };
        this.files.push(file);
        this.activeFile(file);
        return file;
    }

    remove(file: IFileItem) {
        let files = this.files;
        let index = files.indexOf(file);
        if (index >= 0) {
            files.splice(index, 1);
        }
        if (file == this.curFile) {
            let len = files.length;
            if (len <= index)
                this.activeFile(files[len - 1]);
            else
                this.activeFile(files[index]);
        }
    }

    removeAll() {
        this.files = [];
        this.activeFile(null);
    }

    saveToTmpl(title: string) {
        let files = this.files.slice().map((p) => {
            return Object.assign({}, p);
        });
        this._genTmplSrv.add({
            title: title,
            files: files
        })
    }
}
