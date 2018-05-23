import { Injectable } from '@angular/core';
import { GetFileFullList, IFileItem, IGenTypeInfo, ITmplItem, STYLES, TYPES, CloneFile, GetDefaultFile } from '../lib';
import { GenerateTmplService } from './generate-tmpl.service';
import { VscodeMessageService } from './vscode-message.service';

@Injectable()
export class GenerateService {

    constructor(
        private _genTmplSrv: GenerateTmplService,
        private _vsMsg: VscodeMessageService) {
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
        this.curFile = file || GetDefaultFile();
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
        let file = CloneFile(addFileItem);
        this.files.push(file);
        this.activeFile(file);
        return file;
    }

    addFromTmpl(tmpl: ITmplItem) {
        let files = tmpl.files.map((p) => { return CloneFile(p); });
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
            return CloneFile(p);
        });
        this._genTmplSrv.add({
            title: title,
            files: files
        })
    }

    genReports: string[] = [];
    generating = 0;
    generate() {
        this.genReports = [];
        this.generating = 1;
        let saveList = [];
        this.files.forEach((file) => {
            saveList = saveList.concat(GetFileFullList(file));
        });
        let count = saveList.length;
        saveList.forEach((file) => {
            this._vsMsg.saveFile(file.fileName, file.content).subscribe((res) => {
                this.genReports.push(res || (file.fileName + '生成成功！！'));
                count--;
                if (count == 0) {
                    this.generating = 2;
                }
            });
        });
    }
}
