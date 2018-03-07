import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipModalFormComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import { SipModal, SipNgInit, SipFormGroup, ISipFormGroup, SipBusinessComponent, SipFormSubmit, SipRestDef, SipRestMethod, SipRestFunction, SipRestDictDef, SipRestDictFunction, SipOnShow } from 'sip-alain';
import { SipValidators } from '@core/sip/sip-validators';

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

    params = { id: '', datas: null };
    loading = false;

    //等效于ngOnInit, 但可以多次使用
    @SipNgInit()
    private _init() {
        this.params = this.$params(this.params);
        if (this.params.datas)
            this.form.$model = this.params.datas;
    }

    @SipOnShow()
    private _show() {
        console.log('_show');
    }

    @SipFormGroup({
        "num": "",
        "name": "",
        "status": "success",
        "region": "测试云",
        "ip": "",
        "spec": "2核2G",
        "user": "test",
        "date": "2017-11-15"
    }, {
            num: [SipValidators.rangeLength(1, 20)],
            name: [SipValidators.required]
        })
    form: ISipFormGroup<any>;

    statuList = [
        { text: '成功', value: 'success' },
        { text: '处理中', value: 'processing' },
        { text: '失败', value: 'error' }
    ];

    versionList = [
        { version: '1.0' },
        { version: '2.0' }
    ];

    @SipFormSubmit('this.form')
    save() {
        let datas = this.form.$toJSONObject();
        this.loading = true;
        console.log('datas', datas);
        setTimeout(() => {
            this.loading = false;
            this.$close(true);
        }, 400);
    }

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-modal width="720px" height="380px">
    <sip-modal-header>
        <span>{{form?.$name.value || '新建'}}</span>
    </sip-modal-header>
    <sip-modal-body>
        <form nz-form [formGroup]="form">
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label nz-form-item-required>num</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-input formControlName="num"></nz-input>
                    <ng-container *ngIf="form?.$num.dirty || form?.$num.touched">
                        <span nz-form-explain *ngIf="form.$num.errors?.rangeLength">{{form.$num.errors.rangeLengthText}}</span>
                    </ng-container>
                </div>
            </div>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label nz-form-item-required>name</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-input formControlName="name"></nz-input>
                    <span nz-form-explain *ngIf="(form?.$name.dirty || form?.$name.touched) && form?.$name.errors?.required">
                        {{form.$name.errors.requiredText}}
                    </span>
                </div>
            </div>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label>status</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-select formControlName="status" [nzAllowClear]="false" nzShowSearch>
                        <nz-option *ngFor="let item of statuList" [nzLabel]="item.text" [nzValue]="item.value">
                        </nz-option>
                    </nz-select>
                </div>
            </div>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label>region</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-radio-group formControlName="region">
                        <label nz-radio-button [nzValue]="'开发云'">
                            <span>开发云</span>
                        </label>
                        <label nz-radio-button [nzValue]="'测试云'">
                            <span>测试云</span>
                        </label>
                    </nz-radio-group>
                </div>
            </div>
            <nz-divider nzTitle="" nzDashed></nz-divider>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label>ip</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-input formControlName="ip" nzType="text"></nz-input>
                </div>
            </div>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label>spec</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-radio-group formControlName="spec">
                        <label nz-radio [nzValue]="'2核2G'">
                            <span>2核2G</span>
                        </label>
                        <label nz-radio [nzValue]="'2核4G'">
                            <span>2核4G</span>
                        </label>
                        <label nz-radio [nzValue]="'4核4G'">
                            <span>4核4G</span>
                        </label>
                    </nz-radio-group>
                </div>
            </div>
            <div nz-form-item nz-row>
                <div nz-form-label nz-col [nzSm]="4" [nzXs]="24">
                    <label>date</label>
                </div>
                <div nz-form-control nz-col [nzSm]="18" [nzXs]="24">
                    <nz-datepicker formControlName="date"></nz-datepicker>
                </div>
            </div>
        </form>
    </sip-modal-body>
    <sip-modal-footer>
        <button nz-button (click)="save()" [nzType]="'primary'" [nzSize]="'large'"
            [disabled]="loading" [nzLoading]="loading">
            提 交
        </button>
        <button nz-button (click)="$close()">取消</button>
    </sip-modal-footer>
</sip-modal>`;
        return content;
    }

}