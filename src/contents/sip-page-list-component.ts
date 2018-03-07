import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipPageListComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import { SipPage, SipNgInit, SipBusinessComponent, SipAccess, SipAccessManager, Lib, SipAccessItem, MinitableManager } from 'sip-alain';

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

    @SipAccess<${className}>()
    accessManager: SipAccessManager;

    nzdata = [
        {
            num: "i-mysql",
            name: "mysql",
            status: "success",
            region: "开发云",
            ip: "10.202.0.8",
            spec: "2核2G",
            user: "开发账号",
            date: "2017-11-15"
        },
        {
            num: "i-instance",
            name: "实例",
            status: "error",
            region: "开发云",
            ip: "10.202.131.39",
            spec: "2核4G",
            user: "开发账号",
            date: "2017-11-15"
        },
        {
            num: "i-hbase",
            name: "hbase",
            status: "processing",
            region: "开发云",
            ip: "10.202.10.1",
            spec: "4核4G",
            user: "开发账号",
            date: "2017-11-15"
        }
    ];

    searchContent = {
        content: '',
        search: () => {
            this.tableManager.search({ content: this.searchContent.content });
        }
    };

    /**table管理器 */
    tableManager: MinitableManager<any> = new MinitableManager<any>({
        // connstr: 'iaas',
        // sqlId: 'iaas_Instance.List.GetByOwnerID',
        multiSelect: true,
        datas: this.nzdata,
        onSearch: (searchParams: object) => {
            Lib.extend(searchParams, {
                content: '', status: ''
            });
        },
        /** 过滤器设置 */
        filters: {
            /**列名 */
            status: {
                items: [
                    { text: '成功', value: 'success' },
                    { text: '处理中', value: 'processing' },
                    { text: '失败', value: 'error' }
                ],
                onFilter: (p) => {
                    let values = p.values;
                    this.tableManager.search({ status: status });
                }
            }
        },
        /**初始化时触发，表示table已经可以使用 */
        onInit: () => {
            console.log('onInit tableManager1');
        },
        /**选择改变时触发 */
        onSelectChanged: (rows) => {
            this.accessManager.check(this.tableManager.selectDatas);
        },
        /**每次数据加载完成后并处理table业务时触发 */
        onCompleted: () => {
            console.log('onCompleted');
        },
        contextmenu: (menu, rows) => {
            if (!rows.length) { menu.items = []; return; };
            let row = rows[0], data = row.data;

            menu.items = [
                {
                    title: row.isEdit ? '保存' : '编辑',
                    disabled: false,
                    onClick: (p) => {
                        this.edit();
                    }
                }, {
                    title: '测试',
                    disabled: false,
                    onClick: (p) => {
                        this.test();
                    }
                }
            ];
        }
    });

    @SipAccessItem<${className}>('test', {
        multi: false, hasData: true,
        check: function () {
            return true;
        }
    })
    test() {
        let data = this.tableManager.selectFristData;
        if (data)
            alert(data.name);
    }

    editText = '编辑';
    private _checkEditText() {
        let index = this.tableManager.selectRows.findIndex(function (item) { return item.isEdit; });
        this.editText = index > -1 ? '保存' : '编辑';
    }
    @SipAccessItem<${className}>('edit', {
        multi: true, hasData: true,
        check: function () {
            this._checkEditText();
            return true;
        }
    })
    edit() {
        let rows = this.tableManager.selectRows;
        if (rows.length == 0) return;
        let isEdit = this.editText == '保存';
        rows.forEach((row)=>{
            this.tableManager.editRow([row.index], !isEdit);
        })

        this._checkEditText();
    }

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-page>
    <sip-page-header navigator="列表">
        <ng-template #title>列表</ng-template>
        <ng-template #desc>
            列表
            <nz-tooltip [nzTitle]="'了解更多实例介绍'">
                <a nz-tooltip [sipRouterLink]>更多…</a>
            </nz-tooltip>
        </ng-template>
    </sip-page-header>

    <sip-page-body>
        <!-- 卡片 -->
        <sip-card [bordered]="false">
            <ng-template #body>
                <!-- 操作栏 -->
                <sip-page-toolbar>
                    <button nz-button [nzType]="'default'" class="mr-sm">
                        <i class="anticon anticon-reload"></i>
                    </button>
                    <button nz-button (click)="add()" [nzType]="'primary'" class="mr-sm">
                        <i class="anticon anticon-plus"></i>
                        <span>新建</span>
                    </button>
                    <button nz-button (click)="test()" sipAccess="test" [nzType]="'default'" [nzSize]="'large'" class="mr-sm">
                        <i class="anticon anticon-caret-right"></i>
                        <span>测试</span>
                    </button>
                    <nz-dropdown [nzTrigger]="'hover'" [nzPlacement]="'bottomLeft'" class="mr-sm">
                        <button nz-button nz-dropdown>
                            <i class="fa fa-ellipsis-v mr-sm"></i>
                            <span>更多</span>
                            <i class="anticon anticon-down"></i>
                        </button>
                        <ul nz-menu>
                            <li nz-menu-item>
                                <a (click)="edit()" sipAccess="edit">{{editText}}</a>
                            </li>
                            <li nz-menu-item>
                                <a (click)="test()" sipAccess="test">测试</a>
                            </li>
                            <li nz-menu-item>
                                <a [sipRouterLink]>测试</a>
                            </li>
                            <li nz-menu-divider></li>
                            <li nz-submenu>
                                <span title>更多</span>
                                <ul>
                                    <li nz-menu-item>
                                        <a (click)="edit()" sipAccess="edit">{{editText}}</a>
                                    </li>
                                    <li nz-menu-item>
                                        <a (click)="test()" sipAccess="test">测试</a>
                                    </li>
                                    <li nz-menu-item>
                                        <a [sipRouterLink]>测试</a>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </nz-dropdown>

                    <sip-searchConent [params]="searchContent"></sip-searchConent>
                </sip-page-toolbar>

                <div class="mb-md">
                    <nz-alert [nzType]="'info'">
                        <span alert-body>
                            <nz-tag [nzColor]="'purple'" [nzClosable]="true">purple</nz-tag>
                        </span>
                    </nz-alert>
                </div>
                <sip-minitable [manager]="tableManager">
                    <sip-minicolumn name="num" title="编号">
                        <ng-template #formatter let-row="row" let-column="column" let-data="data">
                            <a [sipRouterLink]="['/sip/ui-demo/detail', {id:data.num}]">{{data.num}}</a>
                            <i class="fa fa-desktop ml-sm"></i>
                        </ng-template>
                    </sip-minicolumn>
                    <sip-minicolumn name="name" title="名称" [sortable]="true" sortOrder="desc"></sip-minicolumn>
                    <sip-minicolumn name="status" title="状态">
                        <ng-template #formatter let-row="row" let-column="column" let-data="data">
                            <nz-badge [nzStatus]="data.status" class="mr-sm"></nz-badge>
                            {{column.getFilterText(data.status)}}
                        </ng-template>
                        <ng-template #editor let-row="row" let-column="column" let-data="data">
                            <nz-select [(ngModel)]="data.status">
                                <nz-option *ngFor="let item of column.filterItems" [nzLabel]="item.text" [nzValue]="item.value">
                                </nz-option>
                            </nz-select>
                        </ng-template>
                    </sip-minicolumn>
                    <sip-minicolumn name="region" title="区域" [sortable]="true"></sip-minicolumn>
                    <sip-minicolumn name="ip" title="IP" [sortable]="true"></sip-minicolumn>
                    <sip-minicolumn name="spec" title="系统/规格" [sortable]="true"></sip-minicolumn>
                    <sip-minicolumn name="user" title="创建人" [sortable]="true"></sip-minicolumn>
                    <sip-minicolumn name="date" title="创建时间" [sortable]="true" width="100px"></sip-minicolumn>
                </sip-minitable>
            </ng-template>
        </sip-card>
    </sip-page-body>
</sip-page>`;
        return content;
    }

}