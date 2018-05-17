import { Component } from '@angular/core';
import { VscodeMessageService } from './core/services/vscode-message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  navIndex = 1;

  vscodeOptions: {
    path?: string;
    file?: string;
    isDir?: boolean;
    defaultName?: string;
    fileName?: string;
    extensionPath?: string;
  };

  constructor(vsMsg: VscodeMessageService) {
    this.vscodeOptions = vsMsg.options;
  }

}
