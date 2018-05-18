import { Component } from '@angular/core';
import { ITmplItem } from '../core/lib';
import { GenerateTmplService } from '../core/services/generate-tmpl.service';

@Component({
    selector: 'sip-genrate-tmpl',
    templateUrl: './genrate-tmpl.component.html',
    styles: []
})
export class GenrateTmplComponent {

    constructor(private _tmplSrv: GenerateTmplService) {}

    get tmpls(): ITmplItem[] {
        return this._tmplSrv.tmpls;
    }

    get hasTmpl():boolean{
        return this.tmpls && this.tmpls.length > 0;
      }
    
    get curTmpl():ITmplItem{
        return this._tmplSrv.curTmpl;
    }

    activeTmpl(tmpl: ITmplItem) {
       this._tmplSrv.activeTmpl(tmpl);
    }

    add(tmpl: ITmplItem): ITmplItem {
        return this._tmplSrv.add(tmpl);
    }

    remove(tmpl: ITmplItem) {
        this._tmplSrv.remove(tmpl);
    }

    removeAll() {
        this._tmplSrv.removeAll();
    }
}
