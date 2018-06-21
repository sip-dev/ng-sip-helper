import { Injectable } from '@angular/core';
import { CloneTmpl, DEFAULT_TMPLS, GetDefaultTmpl, ITmplItem, MakeTmplIndex } from '../lib';
import { VscodeMessageService } from './vscode-message.service';

@Injectable()
export class GenerateTmplService {

    constructor(private _vsMsg: VscodeMessageService) {
        let config  = this._vsMsg.config;
        this.tmpls = (config ? config.templates : DEFAULT_TMPLS).map((p) => { return CloneTmpl(p); });
        this.activeTmpl(this.tmpls[0]);
        if (!config) this._save();
    }

    tmpls: ITmplItem[];
    curTmpl: ITmplItem;

    private _save() {
        this._vsMsg.saveConfig(this.tmpls).subscribe();
    }

    activeTmpl(tmpl: ITmplItem) {
        this.curTmpl = tmpl || GetDefaultTmpl();
        if (!tmpl) return;
        this.tmpls.forEach((p) => {
            p.active = (p == tmpl);
        });
    }

    add(tmpl: ITmplItem): ITmplItem {
        tmpl.index = this.tmpls.length;
        this.tmpls.push(tmpl);
        this.activeTmpl(tmpl);
        this._save();
        return tmpl;
    }

    remove(tmpl: ITmplItem) {
        let tmpls = this.tmpls;
        let index = tmpls.indexOf(tmpl);
        if (index >= 0) {
            tmpls.splice(index, 1);
        }
        this._save();
        if (tmpl == this.curTmpl) {
            let len = tmpls.length;
            if (len <= index)
                this.activeTmpl(tmpls[len - 1]);
            else
                this.activeTmpl(tmpls[index]);
        }
    }

    removeAll() {
        this.tmpls = [];
        this._save();
        this.activeTmpl(null);
    }

    sort(){
        this.tmpls = MakeTmplIndex(this.tmpls);
    }
}
