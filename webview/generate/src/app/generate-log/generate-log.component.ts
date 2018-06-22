import { Component, OnInit } from '@angular/core';
import { IVscodeOption } from '../core/lib';
import { GenerateService } from '../core/services/generate.service';
import { VscodeMessageService } from '../core/services/vscode-message.service';

@Component({
  selector: 'sip-generate-log',
  templateUrl: './generate-log.component.html'
})
export class GenerateLogComponent implements OnInit {

  constructor(public genSrv: GenerateService,vsMsg: VscodeMessageService) {
    this.vscodeOptions = vsMsg.options;
    this.genSrv.generate();
  }
  vscodeOptions: IVscodeOption;

  ngOnInit() {
  }
  get genReports(): string[] {
    return this.genSrv.genReports;
  }

}
