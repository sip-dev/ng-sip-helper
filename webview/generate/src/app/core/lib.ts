
export interface IFileItem {
  input: string;
  fileName: string;
  path: string;
  type: string;
  typeInfo?: IGenTypeInfo;
  active: boolean;
  importToModue?: string;
  importToRouting?: string;
  tsContent?: string;
  specContent?: string;
  htmlContent?: string;
  styleContent?: string;
}

export interface IGenTypeInfo {
  ts: boolean;
  html?: boolean;
  style?: boolean;
  styleType?: string;
  spec?: boolean;
  importToModue?: boolean;
  importToRouting?: boolean;
}

export interface IGenType {
  [key: string]: IGenTypeInfo;
}

export const TYPES: IGenType = {
  'module': { ts: true, spec: true, importToModue: true, importToRouting: true },
  'component': { ts: true, html: true, style: true, styleType: "less", spec: true, importToModue: true, importToRouting: true },
  'service': { ts: true, spec: true, importToModue: true },
  'directive': { ts: true, spec: true, importToModue: true, importToRouting: true },
  'pipe': { ts: true, spec: true, importToModue: true, importToRouting: true },
  'class': { ts: true, spec: true },
  'interface': { ts: true },
  'enum': { ts: true }
};

export const STYLES = ['css', 'less', 'sass'];

export const VARS = ['input', 'fileName', 'type', 'path', 'styleType', 'importToModue', 'importToRouting'];

export const getDefaultFile = function (): IFileItem {
  let type = 'component';
  let typeInfo = Object.assign({}, TYPES[type]);
  return {
    input: 'user',
    fileName: '{input}',
    path: '{fileName}',
    type: type,
    typeInfo: typeInfo,
    importToModue: '',
    active: false,
    tsContent: '',
    specContent: '',
    htmlContent: '',
    styleContent: ''
  }
}

export const getFileFullName = function (file: IFileItem): string {
  let type = file.type;
  let typeInfo = file.typeInfo;
  let exts = [];
  typeInfo.ts && exts.push('ts');
  typeInfo.spec && exts.push('spec');
  typeInfo.html && exts.push('html');
  typeInfo.style && exts.push(typeInfo.styleType);
  let name = [file.fileName.trim(), exts.join(' | ')].join('.').replace('..', '.');

  let fullName = [file.path.trim(), name].join('/').replace(/[\\\/]{2,}/g, '/').replace(/^\//, '');
  return getVar(file, fullName);
}

const _varFindRegex = /\{\s*#*\s*([^\}]+)\s*\}/gi;
export const getVar = function (file: IFileItem, value: string): string {
  if (!value) return "";
  _varFindRegex.lastIndex = 0;
  if (!_varFindRegex.test(value)) return value;
  _varFindRegex.lastIndex = 0;
  value = value.replace(_varFindRegex, function (find, name) {
    var text = '';
    if (name == 'styleType') {
      text = file.typeInfo.styleType;
    } else
      text = file[name] ? file[name].replace('{' + name + '}', '') : '';
    text = getVar(file, text);
    return find.indexOf('#') >= 0 ? MakePascalCasingName(text) : text;
  });

  return value;
}

/**
 * 名称转换：sip-user_list.component ===> SipUserListComponent
 * @param name 
 */
export function MakePascalCasingName(name: string) {
  _varFindRegex.lastIndex = 0;
  if (_varFindRegex.test(name)) return name;
  return name.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase(); }).replace(/[^a-z0-9]/gi, '');
}

export interface IVscodeOption {
  path?: string;
  file?: string;
  isDir?: boolean;
  input?: string;
  fileName?: string;
  workspaceRoot?: string;
  extensionPath?: string;
}

export interface ITmplItem {
  title: string;
  active?: boolean;
  files: IFileItem[];
}