import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";
import { SipComponent } from './sip-component';

export class SipPageDetailComponent extends SipComponent {

    contentTS(params: GenerateParam): string {

        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);
        let styleEx = this.styleExt(params);

        let template = !params.html ? `template:''` : `templateUrl: './${name}.${prefix}.html'`;
        let style = !this.isStyle(params) ? `styles: []` : `styleUrls: ['./${name}.${prefix}.${styleEx}']`;

        let content = `import { Component, ViewContainerRef, forwardRef } from '@angular/core';
import * as moment from 'moment';
import { AdChartsModule } from '@delon/abc';
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
	@SipNgInit()
	private _init() {
		this.params = this.$params(this.params);
	}

	nzdata = [
		{
			name: "管理员网络",
			mac: "D0:0D:81:52:0D:9D",
			ip: "10.202.131.39",
			sip: "10.202.131.28"
		},
		{
			name: "管理员网络01",
			mac: "D0:0D:81:52:0D:8D",
			ip: "10.202.131.45",
			sip: "10.202.131.131"
		}
	];

	inboxdata = [
		{
			name: "ceshivolume(vol-CF7C7F54)",
			type: "数据盘",
			inbox: "云存储",
			status: "success",
			statusname: "使用中",
			size: "1G"
		},
		{
			name: "ceshivolume(vol-CF7C7F54)",
			type: "数据盘",
			inbox: "云存储",
			status: "success",
			statusname: "使用中",
			size: "1G"
		},
		{
			name: "ceshivolume(vol-CF7C7F54)",
			type: "数据盘",
			inbox: "云存储",
			status: "success",
			statusname: "使用中",
			size: "1G"
		}
	];

	// 图表数据
	salesData: any[] = [];

	@SipNgInit()
	private _initChart() {
		for (let i = 0; i < 12; i += 1) {
			this.salesData.push({
				x: \`\${i + 1}月\`,
				y: Math.floor(Math.random() * 1000) + 200
			});
		}
	}

}`;
        return content;
    }

    contentHtml(params: GenerateParam): string {
        let content = `<sip-page class="page-detail">
    <sip-page-header navigator="详情">
        <ng-template #title>实例【{{params.id}}】- 详情</ng-template>
        <ng-template #desc>
            一个虚拟机镜像启动之后生成的一个正在运行的系统，它有您期望的硬件配置、操作系统和网络配置。实例也称云服务器、云主机。
        </ng-template>
    </sip-page-header>

    <sip-page-body>
        <!-- tab -->
        <nz-tabset>
            <nz-tab>
                <ng-template #nzTabHeading>概况</ng-template>
                <div nz-row>
                    <div nz-row [nzGutter]="16">
                        <div nz-col [nzMd]="16">
                            <sip-card>
                                <ng-template #title>
                                    <i class="anticon anticon-area-chart mr-sm"></i>监控指标
                                </ng-template>
                                <ng-template #extra>
                                    <button nz-button class="mr-sm"><i class="anticon anticon-reload"></i></button>
                                    <nz-button-group>
                                        <button nz-button>1小时</button>
                                        <button nz-button>2小时</button>
                                        <button nz-button>6小时</button>
                                        <button nz-button>1天</button>
                                        <button nz-button>一周</button>
                                    </nz-button-group>
                                    <nz-dropdown class="ml-sm">
                                        <button nz-button nz-dropdown><i class="anticon anticon-filter"></i> 筛选</button>
                                        <ul nz-menu>
                                            <li nz-menu-item>CPU</li>
                                            <li nz-menu-item>内存</li>
                                            <li nz-menu-item>磁盘</li>
                                            <li nz-menu-item>网络</li>
                                        </ul>
                                    </nz-dropdown>
                                </ng-template>
                                <ng-template #body>
                                    <div class="mb-lg">
                                        <bar height="300" title="销售额趋势" [data]="salesData"></bar>
                                    </div>
                                    
                                    <bar height="300" title="销售额趋势01" [data]="salesData"></bar>
                                </ng-template>
                            </sip-card>
                        </div>
                        <div nz-col [nzMd]="8" >
                            <sip-card>
                                <ng-template #title><i class="anticon anticon-credit-card mr-sm"></i>基本信息</ng-template>
                                <ng-template #body>								
                                    <form nz-form>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>专业</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                <nz-badge [nzStatus]="'processing'" class="mr-sm"></nz-badge>运行中
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>区域</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                开发云
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>所属区域</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                测试集群一
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>镜像</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                SIP
                                            </div>
                                        </div>
                                        <nz-divider class="mb-lg"></nz-divider>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>内存/CPU</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                2核2G
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>内网IP</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                10.202.131.39
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>外网IP</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                无 <a class="ml-sm">绑定IP</a>
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>安全组</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                123 <a class="ml-sm" [sipRouterLink]="['/sip/ui-demo/create']">编辑</a>
                                            </div>
                                        </div>
                                    </form>
                                </ng-template>
                            </sip-card>
                        </div>
                    </div>
                </div>
            </nz-tab>
            <nz-tab>
                <ng-template #nzTabHeading>设备</ng-template>
                <div nz-row>
                    <div nz-row [nzGutter]="16">
                        <div nz-col [nzSpan]="16">
                            <sip-card>
                                <ng-template #title><i class="anticon anticon-wifi mr-sm"></i>网卡</ng-template>
                                <ng-template #extra>
                                    <button nz-button><i class="anticon anticon-plus mr-sm"></i>添加网卡</button>
                                </ng-template>
                                <ng-template #body>
                                    <nz-table #nzTable class="simple-table" [nzDataSource]="nzdata" [nzIsPagination]="false"   [nzBordered]="true" [nzSize]="'middle'">
                                        <thead nz-thead>
                                            <tr>
                                                <th nz-th class="text-center">网络名称</th>
                                                <th nz-th class="text-center">MAC地址</th>
                                                <th nz-th class="text-center">私有IP</th>
                                                <th nz-th class="text-center">弹性IP</th>
                                                <th nz-th class="text-center">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody nz-tbody>
                                            <tr nz-tbody-tr *ngFor="let i of nzTable.data">
                                                <td>{{i.name}}</td>
                                                <td>{{i.mac}}</td>
                                                <td>{{i.ip}}</td>
                                                <td>{{i.sip}}</td>
                                                <td class="text-center">
                                                    <a (click)="customCompModel(i)">编辑</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </nz-table>
                                </ng-template>
                            </sip-card>
                            <sip-card>
                                    <ng-template #title><i class="fa fa-inbox mr-sm"></i>存储卷</ng-template>
                                    <ng-template #extra>
                                        <nz-button-group >
                                            <button nz-button (click)="customCompModel()" ><i class="anticon anticon-reload"></i></button>
                                            <button nz-button (click)="customCompModel()" ><i class="anticon anticon-plus mr-sm"></i>挂接</button>
                                        </nz-button-group>
                                    </ng-template>
                                    <ng-template #body>
                                        <nz-table #nzTable class="simple-table" [nzDataSource]="inboxdata" [nzIsPagination]="false"   [nzBordered]="true" [nzSize]="'middle'">
                                            <thead nz-thead>
                                                <tr>
                                                    <th nz-th class="text-center">名称</th>
                                                    <th nz-th class="text-center">类型</th>
                                                    <th nz-th class="text-center">存储设备</th>
                                                    <th nz-th class="text-center">状态</th>
                                                    <th nz-th class="text-center">大小</th>
                                                    <th nz-th class="text-center">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody nz-tbody>
                                                <tr nz-tbody-tr *ngFor="let i of nzTable.data">
                                                    <td>{{i.name}}</td>
                                                    <td class="text-center">{{i.type}}</td>
                                                    <td class="text-center">{{i.inbox}}</td>
                                                    <td class="text-center">
                                                        <nz-badge class="mr-sm" [nzStatus]="'success'"></nz-badge>{{i.statusname}}
                                                    </td>
                                                    <td class="text-center">{{i.size}}</td>
                                                    <td class="text-center">
                                                        <nz-popconfirm [nzTitle]="'确定要取消挂接吗？'" (nzOnConfirm)="confirm()" (nzOnCancel)="cancel()">
                                                            <a nz-popconfirm>取消挂接</a>
                                                        </nz-popconfirm>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </nz-table>
                                    </ng-template>
                                </sip-card>
                            
                        </div>
                        <div nz-col [nzSpan]="8">
                            <sip-card>
                                <ng-template #title><i class="anticon anticon-credit-card mr-sm"></i>设备信息</ng-template>
                                <ng-template #body>
                                    <form nz-form>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>CPU/内存</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                1核 / 256M  <a class="ml-sm" href="">变更</a>
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>系统盘</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                40G
                                            </div>
                                        </div>
                                        <div nz-form-item nz-row>
                                            <div nz-form-label nz-col [nzSpan]="5">
                                                <label>物理节点</label>
                                            </div>
                                            <div nz-form-control nz-col [nzSpan]="19">
                                                10.202.131.101
                                            </div>
                                        </div>
                                    </form>
                                </ng-template>
                            </sip-card>	
                        </div>
                    </div>
                </div>
            </nz-tab>
            <nz-tab>
                <ng-template #nzTabHeading>消费情况</ng-template>
                <div nz-row>
                    <sip-card [bordered]="false" [noHovering]="true" >
                        <ng-template #body>
                            <div nz-row [nzGutter]="16">
                                <div nz-col [nzSpan]="12">
                                    <div class="page-header">
                                        <div class="avatar"><nz-avatar  nzSrc="https://gw.alipayobjects.com/zos/rmsportal/lctvVCLfRpYCkYxAsiVQ.png"></nz-avatar></div>
                                        <div class="desc">
                                            <div class="desc-title">早安，山治，我要吃肉！</div>
                                            <p>假砖家 | 地球－伟大航道－黄金梅丽号－厨房－小强部门</p>
                                        </div>
                                    </div>
                                </div>
                                <div nz-col [nzSpan]="12" >
                                    <div class="page-extra">
                                        <div>
                                            <p>项目数</p>
                                            <p>56</p>
                                        </div>
                                        <div>
                                            <p>团队内排名</p>
                                            <p>8<span> / 24</span></p>
                                        </div>
                                        <div>
                                            <p>项目访问</p>
                                            <p>2,223</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </sip-card>
                </div>
            </nz-tab>
            <nz-tab>
                <ng-template #nzTabHeading>操作情况</ng-template>
                <div nz-row>
                    sdfsdf
                </div>
            </nz-tab>
        </nz-tabset>
    </sip-page-body>
</sip-page>`;
        return content;
    }

}