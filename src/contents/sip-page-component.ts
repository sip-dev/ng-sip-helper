import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipPageComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import { SipPage, SipNgInit, SipBusinessComponent } from 'sip-alain';

@Component({
    selector: 'sip-${name}',
    ${template},
    ${style},
    providers: [{ provide: SipBusinessComponent, useExisting: forwardRef(() => ${className}) }]
})
export class ${className} extends SipPage {

    constructor(vcf: ViewContainerRef) {
        super(vcf);
    }

    params = { id: '' };

    //等效于ngOnInit, 但可以多次使用
    @SipNgInit()
    private _init() {
        this.params = this.$params(this.params);
    }

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-page>
    <sip-page-header navigator="导航标题">
        <ng-template #title>页面标题</ng-template>
        <ng-template #desc>
            页面描述
        </ng-template>
    </sip-page-header>

    <sip-page-body>
        页面内容
    </sip-page-body>
</sip-page>`;
        return content;
    }

}