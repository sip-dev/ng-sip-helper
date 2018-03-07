import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";

export class SipDirective implements ContentBase {

    prefix = 'directive'

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
            if (!fs.existsSync(fsFile)){
                fs.writeFileSync(fsFile, this.contentTS(params), 'utf-8');
            }
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
        name = MakeClassName(name, '');

        let content = `import { Directive } from '@angular/core';

@Directive({
    selector: '[sip${name}]'
})
export class ${name}Directive {

    constructor() { }

}
`;
        return content;
    }

    contentSpec(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { ${className} } from './${name}.${prefix}';

describe('${className}', () => {
    it('should create an instance', () => {
        const directive = new ${className}();
        expect(directive).toBeTruthy();
    });
});
`;
        return content;
    }

}