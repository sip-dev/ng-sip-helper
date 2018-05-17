import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

declare const vscode: any;

export const vscode_msg = (msg: string, data?: any) => <T>(source: Observable<T>) => {
    return new Observable<T>(observer => {
        source.subscribe({
            next: function (r) {
                vscode.postMessage({ command: msg, data: data });
                let msg_receive = msg + '_receive';
                let fn = function (event) {
                    const message = event.data;
                    let command = message.command;
                    if (command == msg_receive) {
                        window.removeEventListener('message', fn);
                        observer.next(message.data);
                    }
                };
                window.addEventListener('message', fn);
            },
            error: function (r) {
                observer.error(r);
            }
        });
    });
}

@Injectable()
export class VscodeMessageService {

    options: {
        path?: string;
        file?: string;
        isDir?: boolean;
        defaultName?: string;
        fileName?: string;
        extensionPath?: string;
      } = {};
    
    startUP(callback){
        return of(null).pipe(vscode_msg('options')).subscribe((p)=>{
            this.options = p;
            callback();
        });
    }

}
