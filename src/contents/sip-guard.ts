import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";

export class SipGuard implements ContentBase {

    prefix = 'guard'

    generate(params: GenerateParam):string {
        let name = params.name,
            prefix = this.prefix;
        let fsPath = params.path;
        fsPath = params.dir ? path.join(fsPath, name) : fsPath;

        if (!fs.existsSync(fsPath)){
            fs.mkdirSync(fsPath);
        }

        let retFile = '',
            fsFile;

        if (params.ts){
            fsFile = path.join(fsPath, MakeFileName(name, prefix, 'ts'));
            retFile = fsFile;
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.contentTS(params), 'utf-8');
        }

        if (params.spec) {
            fsFile = path.join(fsPath, MakeFileName(name, prefix+'.spec', 'ts'));
            retFile || (retFile = fsFile);
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.contentSpec(params), 'utf-8');
        }

        return retFile;

    }

    contentTS(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ${className} implements CanActivate {
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return true;
    }
}
`;
        return content;
    }

    contentSpec(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { TestBed, async, inject } from '@angular/core/testing';

import { ${className} } from './gg1.guard';

describe('${className}', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [${className}]
        });
    });

    it('should ...', inject([${className}], (guard: ${className}) => {
        expect(guard).toBeTruthy();
    }));
});
`;
        return content;
    }

}