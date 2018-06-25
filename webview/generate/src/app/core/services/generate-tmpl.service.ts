import { Injectable } from '@angular/core';
import { GetDefaultTmpl, ITmplItem, MakeTmplIndex } from '../lib';
import { VscodeMessageService } from './vscode-message.service';

@Injectable()
export class GenerateTmplService {

    constructor(private _vsMsg: VscodeMessageService) {
        let config = this._vsMsg.config;
        this.tmpls = config ? MakeTmplIndex(config.templates) : [];
        this.activeTmpl(this.tmpls[0]);
        if (!config) this.save();
    }

    tmpls: ITmplItem[];
    curTmpl: ITmplItem;

    getTmpl(title: string): ITmplItem {
        let tmpls = this.tmpls.filter((p) => { return p.title == title; });
        return tmpls[0];
    }

    save() {
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
        this.save();
        return tmpl;
    }

    remove(tmpl: ITmplItem) {
        let tmpls = this.tmpls;
        let index = tmpls.indexOf(tmpl);
        if (index >= 0) {
            tmpls.splice(index, 1);
        }
        this.save();
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
        this.save();
        this.activeTmpl(null);
    }

    sort() {
        this.tmpls = MakeTmplIndex(this.tmpls);
        this.save();
    }
}
