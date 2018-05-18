import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IVscodeOption } from '../lib';

declare const vscode: any;

export const vscode_msg = (msg: string, data?: any) => <T>(source: Observable<T>) => {
    return new Observable<T>(observer => {
        source.subscribe({
            next: function (r) {
                if (!environment.isVscode) {
                    observer.next(null); return;
                }
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

    options: IVscodeOption;

    private _sendMsg(msg: string, data?: any): Observable<any> {
        let obs = of(null);
        return environment.isVscode ? obs.pipe(vscode_msg(msg, data)) : obs;
    }

    private _inited = false;
    _startUP(callback: () => void) {
        if (this._inited) { callback(); return }
        this._sendMsg('options').subscribe((p) => {
            this.options = p || {};
            callback();
        });
    }

    close() {
        this._sendMsg('close').subscribe();
    }
    
    saveFile(name:string, content:string): Observable<any>{
        return this._sendMsg('saveFile', {name:name, content:content});
    }

}
