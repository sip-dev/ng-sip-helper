

const ng_gen_config = [
    {
        "title": "component >",
        "command": "ng g component %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false --inline-style true --inline-template false",
                "title": "创建目录, ts, html"
            },
            {
                "param": "--flat true --spec false --inline-style true --inline-template false",
                "title": "ts, html"
            },
            {
                "param": "--flat true --spec false --inline-style true --inline-template true",
                "title": "ts"
            }
        ]
    },
    {
        "title": "module >",
        "command": "ng g module %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "servcie >",
        "command": "ng g service %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "directive >",
        "command": "ng g directive %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "pipe >",
        "command": "ng g pipe %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "class >",
        "command": "ng g class %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "guard >",
        "command": "ng g guard %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "interface >",
        "command": "ng g interface %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    },
    {
        "title": "enum >",
        "command": "ng g enum %input% %params%",
        "terminal": "generate-ngsiphelper",
        "path": "%currentPath%",
        "input": true,
        "params": [
            {
                "param": "--flat false --spec false",
                "title": "创建目录, ts"
            },
            {
                "param": "--flat true --spec false",
                "title": "ts"
            }
        ]
    }
];

module.exports = ng_gen_config;