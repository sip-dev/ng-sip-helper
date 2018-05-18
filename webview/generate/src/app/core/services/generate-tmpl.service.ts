import { Injectable } from '@angular/core';
import { ITmplItem } from '../lib';

@Injectable()
export class GenerateTmplService {

    tmpls: ITmplItem[] = [];
    curTmpl:ITmplItem;

    activeTmpl(tmpl: ITmplItem) {
        this.curTmpl = tmpl;
        if (!tmpl) return;
        this.tmpls.forEach((p) => {
            p.active = (p == tmpl);
        });
    }

    add(tmpl: ITmplItem): ITmplItem {
        this.tmpls.push(tmpl);
        this.activeTmpl(tmpl);
        return tmpl;
    }

    remove(tmpl: ITmplItem) {
        let tmpls = this.tmpls;
        let index = tmpls.indexOf(tmpl);
        if (index >= 0) {
            tmpls.splice(index, 1);
        }
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
        this.activeTmpl(null);
    }
}
