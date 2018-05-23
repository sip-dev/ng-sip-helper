'use strict';
import * as fs from 'fs';
import * as path from 'path';
import { ExtensionContext, Position, Range, Terminal, TextDocument, Uri, ViewColumn, commands, window, workspace } from 'vscode';
import { CalcPath, ContentBase, FindModuleFile, FindPathUpward, FindUpwardModuleFiles, IsDirectory, IsEmptyDirectory, MakeClassName } from './contents/content-base';
import { SipClass } from './contents/sip-class';
import { SipComponent } from './contents/sip-component';
import { SipComponentEx } from './contents/sip-component-ex';
import { SipDirective } from './contents/sip-directive';
import { SipDirectiveEx } from './contents/sip-directive-ex';
import { SipEnum } from './contents/sip-enum';
import { SipGuard } from './contents/sip-guard';
import { SipInterface } from './contents/sip-interface';
import { SipModalComponent } from './contents/sip-modal-component';
import { SipModalFormComponent } from './contents/sip-modal-form-component';
import { SipModule } from './contents/sip-module';
import { SipPageComponent } from './contents/sip-page-component';
import { SipPageDetailComponent } from './contents/sip-page-detail-component';
import { SipPageFormComponent } from './contents/sip-page-form-component';
import { SipPageListComponent } from './contents/sip-page-list-component';
import { SipPipe } from './contents/sip-pipe';
import { SipRegModule } from './contents/sip-reg-module';
import { SipService } from './contents/sip-service';
import { SipServiceEx } from './contents/sip-service-ex';
import { Lib } from './lib';

let argv = require('yargs-parser');


let stringify = require('json-stable-stringify');
var jsonic = require('jsonic');

function getCurrentPath(args): string {
    return args && args.fsPath ? args.fsPath : (window.activeTextEditor ? window.activeTextEditor.document.fileName : '');
}

function getRelativePath(args): string {
    let fsPath = getCurrentPath(args);

    return CalcPath(fsPath);
}

export interface IParam {
    param: string;
    title: string;
    input: boolean;
    terminal?: string;
}

export interface IConfig {
    command: string;
    title: string;
    terminal: string;
    input: boolean;
    path: string;
    builtin: boolean;
    children: IConfig[];
    params: IParam[];
}

export function activate(context: ExtensionContext) {

    let _rootPath = workspace.rootPath;
    let _getRootPath = (): string => {
        return _rootPath;
    }, _calcRootPath = (curPath: string) => {
        curPath = CalcPath(curPath);
        _rootPath = FindPathUpward(workspace.rootPath, curPath, 'package.json')
            && workspace.rootPath;
    };

    context.subscriptions.push({
        dispose: () => {
            Object.keys(terminals).forEach(key => {
                dispose_Terminal(key);
            })
        }
    });
    let mkdirSync = function (fsPath: string) {
        let pathParent = path.dirname(fsPath);
        if (!fs.existsSync(pathParent)) mkdirSync(pathParent);
        fs.mkdirSync(fsPath);
    };
    context.subscriptions.push(commands.registerCommand('ngsiphelper.preview', (args) => {
        let curPath = args ? getCurrentPath(args) : _curFile;
        let isDir = IsDirectory(curPath);
        let fileName = path.basename(curPath);
        let curFile = isDir ? '' : curPath;
        curPath = isDir ? curPath : path.dirname(curPath);
        let isLinux: boolean = curPath.indexOf('/') >= 0;

        let htmlFile = path.join(context.extensionPath, 'webview/generate/dist/generate/index.html')
        let htmlPath = path.dirname(htmlFile);
        const panel = window.createWebviewPanel('sipgenerate', 'sipgenerate', ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [Uri.file(htmlPath)]
        });
        const webview = panel.webview;
        let html = fs.readFileSync(htmlFile, 'utf-8');
        let basePath = Uri.file(htmlPath).with({
            scheme: "vscode-resource"
        }).toString();
        html = html.replace('<base href=".">', `<base href="${basePath}/"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>const vscode = acquireVsCodeApi();window.isVscodeMode = true;</script>`)
        webview.html = html;
        let sendMsg = function (id: string, msg: string, data?: any, err?: any) {
            webview.postMessage({ id: id, command: msg, data: data, err: err })
            return msg + '_receive';
        };
        let receiveMsg = function (id: string, msg: string, data?: any, err?: any) {
            return sendMsg(id, msg + '_receive', data, err);
        };
        let workspaceRoot = _getRootPath();
        webview.onDidReceiveMessage(message => {
            let data = message.data;
            let cmd = message.command;
            let id = message.id;
            switch (cmd) {
                case 'options':
                    let input = isDir ? fileName : fileName.split('.')[0];
                    let opt = {
                        curPath: curPath,
                        curFile: curFile,
                        isDir: isDir,
                        isLinux: isLinux,
                        input: input,
                        prefix: 'app',
                        fileName: isDir ? '' : fileName,
                        workspaceRoot: workspaceRoot,
                        extensionPath: context.extensionPath,
                        modules: FindUpwardModuleFiles(workspaceRoot, curPath).map(file => path.relative(curPath, file))
                    };
                    receiveMsg(id, cmd, opt);
                    break;
                case 'saveConfig':
                    data.content = stringify(JSON.parse(data.content), { space: '    ' });
                    data.flag = 'w';
                case 'saveFile':
                    /**data:{ file: 'demo/demo.ts', content: 'content', basePath:'' } */
                    let file: string = path.join(data.basePath || curPath, data.file);
                    let retFile = path.relative(workspaceRoot, file);
                    let overWrite = data.flag && data.flag.indexOf('w') >= 0;
                    if (file && (overWrite || !fs.existsSync(file))) {
                        try {
                            let content: string = data.content;
                            let fsPath = path.dirname(file);
                            if (!fs.existsSync(fsPath)) {
                                mkdirSync(fsPath);
                            }
                            fs.writeFile(file, content, { encoding: 'utf-8', flag:'w' }, (err) => {
                                receiveMsg(id, cmd, [retFile, err ? err.message : '成功'].join(', '));
                            });
                        } catch (e) {
                            receiveMsg(id, cmd, [retFile, e.message].join(', '));

                        }
                    } else
                        receiveMsg(id, cmd, [retFile, '文件已存在！'].join(', '));
                    break;
                case 'readFile':
                    let readFile: string = path.join(data.basePath || curPath, data.file);
                    let readContent: string = '';
                    if (readFile && fs.existsSync(readFile)) {
                        readContent = fs.readFileSync(readFile, 'utf-8');
                    }
                    receiveMsg(id, cmd, readContent);
                    break;
                case 'importToModule':
                    break;
                case 'importToRouting':
                    break;
                case 'close':
                    panel.dispose();
                    break;
            }
            // console.log(cmd, data);
        }, undefined, context.subscriptions);
    }));

    let _fileName = '', _curFile = '';
    context.subscriptions.push(commands.registerCommand('ngsiphelper.quickpicks', (args) => {
        let curPath = _curFile = getCurrentPath(args),
            defaultName = path.basename(curPath);
        _fileName = defaultName.split('.')[0];

        _calcRootPath(curPath);

        let configs = getConfig();

        showQuickPick(configs, _getRootPath(), args);

    }));

    let terminals = {};
    let send_terminal = (name: string, path: string, cmd: string) => {
        name || (name = "ng-alain-sip");
        dispose_Terminal(name);
        let terminal = terminals[name] = window.createTerminal(name);
        terminal.show(true);
        path && terminal.sendText('cd "' + path + '"');
        terminal.sendText(cmd);
    };
    let dispose_Terminal = (name: string) => {
        let terminal: Terminal = terminals[name];
        try {
            if (terminal) {
                terminals[name] = null;
                terminal.dispose();
            }
        } catch (e) {
            return;
        }
    };
    let getVarText = (text: string, params: { args: any; input: string; params: string; }): string => {
        text = text.replace(/\%currentpath\%/gi, getRelativePath(params.args));
        text = text.replace(/\%workspaceroot\%/gi, _getRootPath());
        text = text.replace(/\%input\%/gi, params.input);
        text = text.replace(/\%params\%/gi, params.params);
        return text;
    };
    let openFile = (file: string): PromiseLike<TextDocument> => {
        return file ? workspace.openTextDocument(file).then(r => {
            window.showTextDocument(r);
            return r;
        }) : Promise.resolve<any>(null);
    };
    let send_builtin = (config: IConfig, args, params: string, fsPath: string, inputText: string) => {
        let p = argv(params || '');
        let rootPath = _getRootPath();
        let gParam = Object.assign({
            name: inputText,
            path: fsPath,
            rootPath: rootPath,
            moduleFile: FindModuleFile(rootPath, fsPath)
        }, p);
        switch (config.command) {
            case 'config':
                setConfig();
                break;
            case 'npm':
                npm();
                break;
            case 'snippet-text':
                commands.executeCommand('ngsiphelper.tosnippettext');
                break;
            case 'json-class':
                commands.executeCommand('ngsiphelper.jsontoclass');
                break;
            case 'region':
                commands.executeCommand('ngsiphelper.region');
                break;
            case 'sip-preview':
                commands.executeCommand('ngsiphelper.preview');
                break;
            case 'ng-generate':
                let generateConfigs: IConfig[] = require('./ng-generate.conf');
                showQuickPick(generateConfigs, rootPath, args);
                break;
            case 'sip-page':
                sipGenerate(new SipPageComponent(), gParam);
                break;
            case 'sip-page-list':
                sipGenerate(new SipPageListComponent(), gParam);
                break;
            case 'sip-page-form':
                sipGenerate(new SipPageFormComponent(), gParam);
                break;
            case 'sip-page-detail':
                sipGenerate(new SipPageDetailComponent(), gParam);
                break;
            case 'sip-modal':
                sipGenerate(new SipModalComponent(), gParam);
                break;
            case 'sip-modal-form':
                sipGenerate(new SipModalFormComponent(), gParam);
                break;
            case 'sip-component':
                sipGenerate(new SipComponent(), gParam);
                break;
            case 'sip-component-ex':
                sipGenerate(new SipComponentEx(), gParam);
                break;
            case 'sip-module':
                if (gParam.shared) {
                    gParam.shared = false;
                    let name = gParam.name;
                    gParam.name += '-shared';
                    gParam.dir = true;
                    gParam.ts = true;
                    sipGenerate(new SipModule(), gParam).then((p) => {
                        let moduleFile = p.fileName;
                        let tPathM = path.join(gParam.path, gParam.name);
                        gParam.name = name;
                        gParam.dir = false;
                        gParam.path = path.join(tPathM, 'models');
                        sipGenerate(new SipClass(), gParam);
                        gParam.path = path.join(tPathM, 'services');
                        sipGenerate(new SipServiceEx(), gParam).then((p) => {
                            gParam.module = true;
                            gParam.path = p.fileName;
                            gParam.moduleFile = moduleFile;
                            new SipRegModule().generate(gParam);
                        });
                    });
                } else
                    sipGenerate(new SipModule(), gParam);
                break;
            case 'sip-service':
                sipGenerate(new SipService(), gParam);
                break;
            case 'sip-service-ex':
                sipGenerate(new SipServiceEx(), gParam);
                break;
            case 'sip-directive':
                sipGenerate(new SipDirective(), gParam);
                break;
            case 'sip-directive-ex':
                sipGenerate(new SipDirectiveEx(), gParam);
                break;
            case 'sip-pipe':
                sipGenerate(new SipPipe(), gParam);
                break;
            case 'sip-guard':
                sipGenerate(new SipGuard(), gParam);
                break;
            case 'sip-interface':
                sipGenerate(new SipInterface(), gParam);
                break;
            case 'sip-class':
                sipGenerate(new SipClass(), gParam);
                break;
            case 'sip-enum':
                sipGenerate(new SipEnum(), gParam);
                break;
            case 'sip-regmodlue':
                sipRegmodlue(new SipRegModule(), gParam);
                break;
            case 'sip-gen-del':
                if (IsDirectory(_curFile)) {
                    window.showWarningMessage('不能处理目录!');
                } else {
                    window.showInformationMessage(`确定要删除 ${path.basename(_curFile)} 吗?`, '确定').then((text) => {
                        if (text == '确定') sipGenerateDel(gParam);
                    });
                }
                break;
        }
    };
    let sipGenerate = (genObj: ContentBase, p: any, args?: any): PromiseLike<TextDocument> => {
        return openFile(genObj.generate(p));
    };
    let sipRegmodlue = (genObj: ContentBase, p: any) => {
        if (IsDirectory(_curFile)) {
            window.showWarningMessage('不能处理目录!');
            return;
        }
        let rootPath = p.rootPath;
        let curFile = p.path = _curFile;
        let curPath = path.dirname(_curFile);
        p.name = path.basename(_curFile).split('.')[0];
        let files = FindUpwardModuleFiles(rootPath, curFile);
        let routingRegex = /\-routing\./i;
        files = files.filter((file) => {
            if (p.module && p.routing) return true;
            if (p.routing) return routingRegex.test(file);
            if (p.module || p.both) return !routingRegex.test(file);

            if (p.cleanmodule && p.cleanrouting) return true;
            if (p.cleanrouting) return routingRegex.test(file);
            if (p.cleanmodule || p.cleanboth) return !routingRegex.test(file);
        });
        let picks = files.map(file => path.relative(curPath, file));
        window.showQuickPick(picks).then(file => {
            if (!file) return;
            file = path.join(curPath, file);
            if (p.both || p.cleanboth) {
                //处理module
                p.moduleFile = file;
                p.module = p.both;
                p.routing = false;
                p.cleanmodule = p.cleanboth;
                p.cleanrouting = false;
                genObj.generate(p);
                //处理routing
                p.moduleFile = file.replace(/\.module\.ts$/, '-routing.module.ts');
                p.module = false;
                p.routing = p.both;
                p.cleanmodule = false;
                p.cleanrouting = p.cleanboth;
                genObj.generate(p);

            } else {
                p.moduleFile = file;
                genObj.generate(p);
            }
        });
    };
    let sipGenerateDel = (p: any, args?: any) => {
        p.cleanmodule = true;
        p.cleanrouting = true;
        let rootPath = p.rootPath;
        let curFile = p.path = _curFile;
        p.name = path.basename(_curFile).split('.')[0];
        let files = FindUpwardModuleFiles(rootPath, curFile);
        files.forEach((file) => {
            if (!file) return;
            p.moduleFile = file;
            new SipRegModule().generate(p);
        });

        let delInfo = path.parse(curFile);
        let delPath = path.join(delInfo.dir, delInfo.name);
        ['html', 'ts', 'css', 'less', 'spec.ts'].map((item) => {
            let file = [delPath, item].join('.');
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        })
        if (IsEmptyDirectory(delInfo.dir))
            fs.rmdirSync(delInfo.dir);
    };
    let showQuickPick = (configs: IConfig[], parentPath: string, args) => {
        let picks = configs.map(item => item.title);

        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let config: IConfig = configs.find(item => item.title == title);
            if (!config) return;
            let path = config.path ? config.path : parentPath;
            let children = config.children;
            let params = config.params;
            if (children && children.length > 0) {
                showQuickPick(children, path, args);
            } else if (params && params.length > 0) {
                showParamsQuickPick(config, path, args);
            } else {
                send_command(config.terminal, path, config.command, '', config.input, args, config);
            }
        });

    };
    let showParamsQuickPick = (config: IConfig, path: string, args) => {
        let params = config.params;

        let doneFn = (param: IParam) => {
            let cmd = config.command;
            if (!cmd) return;
            let input = 'input' in param ? param.input : config.input;
            send_command(param.terminal || config.terminal, path, cmd, param.param, input, args, config);
        };

        if (params.length <= 1) {
            doneFn(params[0]);
            return;
        }

        let picks = params.map(item => item.title);
        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let param: IParam = params.find(item => item.title == title);
            param && doneFn(param);
        });
    };

    let send_command = (name: string, path: string, cmd: string, params: string, input: boolean, args, config: IConfig, inputText = '') => {
        if (!input) {
            path = getVarText(path, {
                args: args,
                input: inputText, params: params
            });
            if (config.builtin) {
                send_builtin(config, args, params, path, inputText);
            } else if (cmd) {
                cmd = getVarText(cmd, {
                    args: args,
                    input: inputText, params: params
                });
                send_terminal(name, path, cmd);
            }
        }
        else {
            window.showInputBox({
                prompt: '请输入文件名称/内容？',
                value: _fileName
            }).then((fileName) => {
                if (fileName) {
                    if (/[~`!#$%\^&*+=\[\]\\';,{}|\\":<>\?]/g.test(fileName)) {
                        window.showInformationMessage('文件名称存在不合法字符!');
                    } else {
                        send_command(name, path, cmd, params, false, args, config, fileName);
                    }
                }
            },
                (error) => console.error(error));
        }
    };


    let getConfig = (): IConfig[] => {
        let fsPath = path.join(_getRootPath(), './ng-alain-sip.conf.json');
        return (!fs.existsSync(fsPath)) ? require('./ng-alain-sip.conf') : jsonic(fs.readFileSync(fsPath, 'utf-8'));
    };

    let setConfig = () => {
        let fsPath = path.join(_getRootPath(), './ng-alain-sip.conf.json');
        if (!fs.existsSync(fsPath))
            saveDefaultConfig();

        workspace.openTextDocument(fsPath).then((textDocument) => {
            if (!textDocument) return;
            window.showTextDocument(textDocument).then((editor) => {
            });
        });

    };

    let saveDefaultConfig = () => {
        let fsPath = path.join(_getRootPath(), './ng-alain-sip.conf.json');
        let json = stringify(require('./ng-alain-sip.conf'), { space: '    ' });
        fs.writeFileSync(fsPath, json, 'utf-8');
    };

    let npm = () => {
        let fsPath = path.join(_getRootPath(), './package.json');
        if (!fs.existsSync(fsPath)) return;
        let packageJson = jsonic(fs.readFileSync(fsPath, 'utf-8'));
        let scripts = packageJson.scripts;
        let scriptList = Object.keys(scripts).map(key => {
            return {
                command: 'npm run ' + key,
                title: key
            };
        });
        let picks = scriptList.map(item => item.title);

        window.showQuickPick(picks).then((title) => {
            if (!title) return;
            let item: any = scriptList.find(item => item.title == title);
            if (!item) return;
            send_terminal('npm-ngsiphelper', _getRootPath(), item.command);
        });
    };

    context.subscriptions.push(commands.registerTextEditorCommand('ngsiphelper.tosnippettext', (textEditor, edit) => {
        _calcRootPath(textEditor.document.fileName);

        var { document, selection } = textEditor
        let isEmpty = textEditor.selection.isEmpty;

        var text = isEmpty ? document.getText() : document.getText(textEditor.selection);
        text = formatSnippetText(text);
        edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
            textEditor.selection, text);
    }))

    let formatSnippetText = (text: string): string => {

        let preLen = -1;
        text = ['["', text.replace(/\n\r|\r\n/g, '\n').split('\n').map(item => {
            if (preLen == -1) {
                preLen = /^\s*/.exec(item)[0].length || 0;
            }
            return item.replace(/(\"|\\)/g, '\\$1').replace(/(\$)/g, '\\\\$1').substr(preLen).replace(/\t/g, '\\t');
        }).join('",\n"'), '$0"]'].join('');

        return text;
    };

    context.subscriptions.push(commands.registerTextEditorCommand('ngsiphelper.jsontoclass', (textEditor, edit) => {
        let fsFile: string = textEditor.document.fileName;
        _calcRootPath(fsFile);

        let { document, selection } = textEditor

        let isEmpty = textEditor.selection.isEmpty;

        let text = isEmpty ?
            document.getText() :
            document.getText(textEditor.selection);
        try {

            text = jsonToClass(jsonic(text), fsFile);
            edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
                textEditor.selection, text);
        } catch (e) {
            window.showErrorMessage(e.message);
        }
    }))

    let jsonToClass = (json: object, fsFile: string): string => {
        let props = [], item, defName;
        Object.keys(json).forEach(key => {
            item = json[key];
            key += '?';
            if (Lib.isString(item)) {
                defName = key + ': string';
                props.push('    ' + defName + ' = "";');
            } else if (Lib.isBoolean(item)) {
                defName = key + ': boolean';
                props.push('    ' + defName + ' = false;');
            } else if (Lib.isNumeric(item)) {
                defName = key + ': number';
                props.push('    ' + defName + ' = 0;');
            } else if (Lib.isArray(item)) {
                defName = key + ': any[]';
                props.push('    ' + defName + ' = [];');
            } else if (Lib.isObject(item)) {
                defName = key + ': object';
                props.push('    ' + defName + ' = {};');
            } else {
                defName = key + ': any';
                props.push('    ' + defName + ' = null;');
            }
        });

        let fInfo = path.parse(fsFile);
        let className = MakeClassName(fInfo.name, '');
        let classText = `//定义模型(model)
export class ${className} {

${props.join('\n')}

    constructor(p?:${className}) {
        if (p){
            Object.assign(this, p);
        }
    }
}`;

        return classText;
    };

    context.subscriptions.push(commands.registerTextEditorCommand('ngsiphelper.region', (textEditor, edit) => {
        _calcRootPath(textEditor.document.fileName);

        var { document, selection } = textEditor
        let isEmpty = textEditor.selection.isEmpty;
        if (isEmpty) return;

        var text = document.getText(textEditor.selection);
        var time = new Date().valueOf();

        text = ['    //#region region' + time + '\n', text, '    //#endregion region' + time + '\n'].join('\n');
        edit.replace(isEmpty ? new Range(new Position(0, 0), new Position(100000, 100000)) :
            textEditor.selection, text);
    }))

}

