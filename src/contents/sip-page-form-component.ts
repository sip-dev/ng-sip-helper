import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipPageFormComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import { SipPage, SipNgInit, SipOnShow, SipBusinessComponent, SipFormGroup, ISipFormGroup, SipFormSubmit } from 'sip-alain';
import { SipValidators } from '@core/sip/sip-validators';

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

    params = { id: '', datas: null };
    loading = false;

    //等效于ngOnInit, 但可以多次使用
    @SipNgInit()
    private _init() {
        this.params = this.$params(this.params);
        if (this.params.datas)
            this.form.$model = JSON.parse(this.params.datas);
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
        return;
    }

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-page>
    <sip-page-header navigator="导航标题">
        <ng-template #title>{{form?.$name.value || '新建'}}</ng-template>
        <ng-template #desc>
            页面描述
        </ng-template>
    </sip-page-header>

    <sip-page-body>
        <div nz-row [nzGutter]="24">
            <div nz-col [nzXl]="24" [nzMd]="24">
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
                    <div nz-form-item nz-row>
                        <div nz-form-control nz-col [nzSpan]="14" [nzXs]="24" [nzOffset]="6">
                            <label nz-checkbox>
                                <span>记住我的选择</span>
                            </label>

                            <div class="mt-sm">
                                <button nz-button [nzType]="'primary'" class="mr-sm" (click)="save()" [disabled]="loading" [nzLoading]="loading">申请</button>
                                <button nz-button (click)="$close()">取消</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </sip-page-body>
</sip-page>`;
        return content;
    }

}