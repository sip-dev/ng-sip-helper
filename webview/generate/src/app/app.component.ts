import { Component } from '@angular/core';
import { IVscodeOption } from './core/lib';
import { VscodeMessageService } from './core/services/vscode-message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  navIndex = 1;

  vscodeOptions: IVscodeOption;

  constructor(vsMsg: VscodeMessageService) {
    this.vscodeOptions = vsMsg.options;
  }

}
