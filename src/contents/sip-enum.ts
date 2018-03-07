import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName } from "./content-base";

export class SipEnum implements ContentBase {

    generate(params: GenerateParam):string {
        let name = params.name,
            prefix = '';
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
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.content(params), 'utf-8');
        }

        return retFile;

    }

    content(params: GenerateParam): string {
        let name = params.name;
        let prefix = '';
        let className = MakeClassName(name, prefix);
        let content = `export enum ${className} {
}
`;
        return content;
    }


}