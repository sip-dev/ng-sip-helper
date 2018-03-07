import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipModalComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import { SipModal, SipNgInit, SipBusinessComponent } from 'sip-alain';

@Component({
    selector: 'sip-${name}',
    ${template},
    ${style},
    providers: [{ provide: SipBusinessComponent, useExisting: forwardRef(() => ${className}) }]
})
export class ${className} extends SipModal {

    constructor(vcf: ViewContainerRef) {
        super(vcf);
    }

    params = { id: '' };

    //等效于ngOnInit, 但可以多次使用
    @SipNgInit()
    private _init() {
        this.params = this.$params(this.params);
    }

    save(event) {
        this.$close(true);
    }

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-modal width="500px" height="300px">
    <sip-modal-header>
        <span>标题 - [ {{params.id}} ]</span>
    </sip-modal-header>
    <sip-modal-body>
        <div>
            <p>对话框的内容</p>
            <p>对话框的内容</p>
            <p>对话框的内容</p>
            <p>对话框的内容</p>
            <p>对话框的内容</p>
        </div>
    </sip-modal-body>
    <sip-modal-footer>
        <button nz-button [nzType]="'primary'" [nzSize]="'large'" (click)="save($event)" [nzLoading]="false">
            提 交
        </button>
    </sip-modal-footer>
</sip-modal>`;
        return content;
    }

}