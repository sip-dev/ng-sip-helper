import { Injectable } from '@angular/core';
import { IFileItem, IGenTypeInfo, ITmplItem, STYLES, TYPES, cloneFile, getDefaultFile } from '../lib';
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

    files: IFileItem[] = [];

    curFile: IFileItem;

    activeFile(file: IFileItem) {
        this.curFile = file || getDefaultFile();
        this.curTypeInfo = TYPES[this.curFile.type];
        if (!file) return;
        this.files.forEach((p) => {
            p.active = (p == file);
        });
    }

    changeType() {
        let file = this.curFile;
        this.curTypeInfo = TYPES[file.type];
        file.typeInfo = Object.assign({}, this.curTypeInfo);
    }

    add(addFileItem: IFileItem): IFileItem {
        let file = cloneFile(addFileItem);
        this.files.push(file);
        this.activeFile(file);
        return file;
    }

    addFromTmpl(tmpl: ITmplItem) {
        let files = tmpl.files.map((p) => { return cloneFile(p); });
        if (files.length == 0) return;
        let len = this.files.length;
        this.files = this.files.concat(files);
        this.activeFile(this.files[len]);
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
            return cloneFile(p);
        });
        this._genTmplSrv.add({
            title: title,
            files: files
        })
    }
}
