

const config = [
    {
        "title": "Serve >",
        //指令可以使用变量 %params%, %input%, %workspaceRoot%, %currentPath%"
        "command": "npm run start %params%",
        //vscod terminal 名称
        "terminal": "serve-ngsiphelper",
        //路径可以使用变量 %params%, %input%, %workspaceRoot%, %currentPath%"
        "path": "%workspaceRoot%",
        //是否需要输入内容, 并压入%input%变更
        "input": false,
        //是否内置指令
        "builtin": false,
        //指令参数(二级选择), 并压入%params%变更
        "params": [
            {
                "param": "-- -e=dev",
                "title": "Dev",
                //vscod terminal 名称, 如果没有，取config.terminal
                "terminal": "",
                //是否需要输入内容, 并压入%input%变更, 如果没有，取config.input
                "input": false
            }, {
                "param": "-- -e=dev -pc=\"proxy.conf.js\"",
                "title": "Dev Proxy"
            }, {
                "param": "-- --hmr -e=hmr",
                "title": "HMR"
            }, {
                "param": "-- --hmr -e=hmr -pc=\"proxy.conf.js\"",
                "title": "HMR Proxy"
            }, {
                "param": "-- --prod -e=prod -pc=\"proxy.conf.js\"",
                "title": "PROD Proxy"
            }
        ]
    },
    {
        "title": "Build >",
        "command": "npm run build %params%",
        "terminal": "build-ngsiphelper",
        "path": "%workspaceRoot%",
        "input": false,
        "params": [
            {
                "param": "",
                "title": "Build"
            }, {
                "param": "-- -prod -e=prod --build-optimizer",
                "title": "Build PROD"
            }
        ]
    },
    {
        "title": "Generate >",
        "command": "sip-generate",
        "builtin": true
    },
    {
        "title": "注册 Modlue >",
        "command": "",
        'children': [
            {
                "title": "Module >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--module",//params: module,routing, both, export(是否自动生成export)
                        "title": "Module"
                    }
                ]
            },
            {
                "title": "Routing >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--routing",
                        "title": "Routing"
                    }
                ]
            },
            {
                "title": "Module And Routing >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--both",
                        "title": "Module And Routing"
                    }
                ]
            },
            {
                "title": "撤消 Module >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--cleanmodule",
                        "title": "Module"
                    }
                ]
            },
            {
                "title": "撤消 Routing >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--cleanrouting",
                        "title": "Routing"
                    }
                ]
            },
            {
                "title": "撤消 Module And Routing >",
                "command": "sip-regmodlue",
                "path": "%currentPath%",
                "builtin": true,
                "input": false,
                "params": [
                    {
                        "param": "--cleanboth",
                        "title": "Module And Routing"
                    }
                ]
            }
        ]
    },
    {
        "title": "Npm >",
        "command": "npm",
        "builtin": true
    },
    {
        "title": "设 置",
        "command": "config",
        "builtin": true
    },
    {
        "title": "Other >",
        "command": "",
        children: [
            {
                "title": "JSON To Class",
                "command": "json-class",
                "builtin": true
            },
            {
                "title": "To Snippet Text",
                "command": "snippet-text",
                "builtin": true
            },
            {
                "title": "Region Block",
                "command": "region",
                "builtin": true
            }
        ]
    }
];

module.exports = config;