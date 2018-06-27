import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { GetFileFullName, IFileItem, ITmplItem } from '../core/lib';
import { GenerateTmplService } from '../core/services/generate-tmpl.service';
import { GenerateService } from '../core/services/generate.service';
import { VscodeMessageService } from '../core/services/vscode-message.service';

@Component({
    selector: 'sip-genrate-tmpl',
    templateUrl: './genrate-tmpl.component.html',
    styles: []
})
export class GenrateTmplComponent {

    constructor(private _tmplSrv: GenerateTmplService, private _vsMsg: VscodeMessageService,
        public genSrv: GenerateService,
        private _app: AppComponent) {
            document.addEventListener('keydown', (e) => {
                if (e.keyCode == 27) this._vsMsg.close();
              });
         }

    public get isEditFileMode() {
        return this._app.isEditFileMode;
    }
    public set isEditFileMode(value) {
        this._app.isEditFileMode = value;
    }

    get tmpls(): ITmplItem[] {
        return this._tmplSrv.tmpls;
    }

    get hasTmpl(): boolean {
        return this.tmpls && this.tmpls.length > 0;
    }

    get curTmpl(): ITmplItem {
        return this._tmplSrv.curTmpl;
    }

    activeTmpl(tmpl: ITmplItem) {
        this._tmplSrv.activeTmpl(tmpl);
        this.activeFile(tmpl.files[0]);
    }

    remove(tmpl: ITmplItem) {
        this._tmplSrv.remove(tmpl);
    }

    removeAll() {
        this._tmplSrv.removeAll();
    }


    activeFile(file: IFileItem) {
        if (!file) return;
        this.curTmpl.files.forEach((p) => {
            p.active = (p == file);
        });
    }

    getFileFullName(file: IFileItem) {
        file.input = this._vsMsg.input;
        return GetFileFullName(file);
    }

    removeFile(file: IFileItem) {
        let files = this.curTmpl.files;
        let index = files.indexOf(file);
        if (index >= 0) {
            files.splice(index, 1);
        }
        if (file.active) {
            let len = files.length;
            if (len <= index)
                this.activeFile(files[len - 1]);
            else
                this.activeFile(files[index]);
        }
    }

    report() {
        console.log(JSON.stringify(this.tmpls));
    }

    edit(tmpl: ITmplItem) {
        this.genSrv.editTmpl(tmpl).subscribe((p)=>{
            this._tmplSrv.save();
        });
        this.isEditFileMode = true;
    }
    add(){
        let tmpl:ITmplItem = {
            title: 'new_tmpl',
            files: []
        };
        this.genSrv.editTmpl(tmpl).subscribe((tmpl)=>{
            this._tmplSrv.add(tmpl);
        });
        this.isEditFileMode = true;
    }
    copy(tmpl: ITmplItem){
        this._tmplSrv.copy(tmpl);
    }
    sortTmpl(){
        this._tmplSrv.sort();
    }
}
