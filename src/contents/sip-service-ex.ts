import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";

export class SipServiceEx implements ContentBase {

    prefix = 'service'

    generate(params: GenerateParam): string {
        let name = params.name,
            prefix = this.prefix;
        let fsPath = params.path;
        fsPath = params.dir ? path.join(fsPath, name) : fsPath;

        if (!fs.existsSync(fsPath)) {
            fs.mkdirSync(fsPath);
        }

        let retFile = '',
            fsFile;

        if (params.ts) {
            fsFile = path.join(fsPath, MakeFileName(name, prefix, 'ts'));
            retFile = fsFile;
            if (!fs.existsSync(fsFile)) {
                fs.writeFileSync(fsFile, this.contentTS(params), 'utf-8');
            }
        }

        if (params.spec) {
            fsFile = path.join(fsPath, MakeFileName(name, prefix + '.spec', 'ts'));
            retFile || (retFile = fsFile);
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.contentSpec(params), 'utf-8');
        }

        return retFile;

    }

    contentTS(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { Injectable, Injector } from '@angular/core';
import { SipService } from 'sip-alain';

@Injectable()
export class ${className} extends SipService {

    constructor(injector: Injector) {
        super(injector);
    }

}
`;
        return content;
    }

    contentSpec(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { TestBed, inject } from '@angular/core/testing';

import { ${className} } from './${name}.${prefix}';

describe('${className}', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [${className}]
        });
    });

    it('should be created', inject([${className}], (service: ${className}) => {
        expect(service).toBeTruthy();
    }));
});
`;
        return content;
    }

}