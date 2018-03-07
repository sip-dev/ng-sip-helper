import * as path from 'path';
import * as fs from 'fs';

import { ContentBase, GenerateParam, MakeFileName, MakeClassName, FindSharedModuleFiles, CalcImportPath } from "./content-base";

export class SipModule implements ContentBase {

    prefix = 'module';

    // private isSip(fsFile:string):boolean{
    //     let exi = /[\\\/]sip[\\\/]/i.exec(fsFile);
    //     if (exi){
    //         if (/[\\\/](?:sip\-core|sip-shared)/i.test(fsFile)) return false;
    //         let find = exi[0];
    //         let fsPath = fsFile.substr(0, exi.index + find.length);
    //         fsPath = path.join(fsPath, 'sip-shared');
    //         return fs.existsSync(fsPath);
    //     } else {
    //         return false;
    //     }
    // }

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

        let sharedModuleFiles = [];
        FindSharedModuleFiles(sharedModuleFiles, params.rootPath, fsPath);
        params.sharedModuleFiles = sharedModuleFiles.reverse();

        if (params.ts) {
            fsFile = path.join(fsPath, MakeFileName(name, prefix, 'ts'));
            retFile = fsFile;
            if (!fs.existsSync(fsFile)) {
                fs.writeFileSync(fsFile, this.contentTS(params, fsFile), 'utf-8');
            }
        }

        if (params.routing) {
            let routingName = [name, 'routing'].join('-');
            fsFile = path.join(fsPath, MakeFileName(routingName, prefix, 'ts'));
            retFile || (retFile = fsFile);
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.contentRoutingTS(params, fsFile), 'utf-8');
        }

        if (params.spec) {
            fsFile = path.join(fsPath, MakeFileName(name, prefix + '.spec', 'ts'));
            retFile || (retFile = fsFile);
            fs.existsSync(fsFile) || fs.writeFileSync(fsFile, this.contentSpec(params), 'utf-8');
        }

        return retFile;

    }

    contentTS(params: GenerateParam, fsFile:string): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let sipImport = params.sharedModuleFiles.map((item)=>{
            let importPath = CalcImportPath(fsFile, item);
            let className = MakeClassName(path.basename(path.dirname(item)), prefix);
            return `import { ${className} } from '${importPath}';\n`
        }).join('');
        let sipModuleImport = params.sharedModuleFiles.map((item)=>{
            let className = MakeClassName(path.basename(path.dirname(item)), prefix);
            return `,\n        ${className}`;
        }).join('');

        let content = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
${sipImport}
@NgModule({
    imports: [
        CommonModule,
        SharedModule${sipModuleImport}
    ],
    declarations: [],
    providers: [],
    exports:[],
    entryComponents:[]
})
export class ${className} { }
`;
        return content;
    }

    contentRoutingTS(params: GenerateParam, fsFile:string): string {
        let prefix = this.prefix;
        let ipClassName = MakeClassName(params.name, prefix);
        let name = [params.name, 'routing'].join('-');
        let className = MakeClassName(name, prefix);
        
        let importModule = params.ts ? `import { ${ipClassName} } from './${params.name}.module';\n` : '';
        let importClass  = params.ts ? '\n        ' + ipClassName + ',' : '';

        let sipImport = params.sharedModuleFiles.map((item)=>{
            let importPath = CalcImportPath(fsFile, item);
            let className = MakeClassName(path.basename(path.dirname(item)), prefix);
            return `import { ${className} } from '${importPath}';\n`
        }).join('');
        let sipModuleImport = params.sharedModuleFiles.map((item)=>{
            let className = MakeClassName(path.basename(path.dirname(item)), prefix);
            return `,\n        ${className}`;
        }).join('');

        let content = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
${importModule}${sipImport}
const routes: Routes = [];

@NgModule({
    imports: [
        CommonModule,
        SharedModule${sipModuleImport},${importClass}
        RouterModule.forChild(routes)
    ]
})
export class ${className} { }
`;
        return content;
    }

    contentSpec(params: GenerateParam): string {
        let name = params.name;
        let prefix = this.prefix;
        let className = MakeClassName(name, prefix);

        let content = `import { ${className} } from './${name}.${prefix}';

describe('${className}', () => {
    let instance: ${className};

    beforeEach(() => {
        instance = new ${className}();
    });

    it('should create an instance', () => {
        expect(instance).toBeTruthy();
    });
});
`;
        return content;
    }

}