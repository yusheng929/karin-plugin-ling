export const helpCfg = {
    themeSet: false,
    title: '铃帮助',
    subTitle: '提供便携式操作',
    colCount: 3,
    colWidth: 265,
    theme: 'all',
    bgBlur: true,
};
export const helpList = [
    {
        group: '群管功能',
        list: [
            {
                icon: 1,
                title: '#全体(禁言|解禁)',
                desc: '字面意思',
            },
            {
                icon: 2,
                title: '#禁言<@QQ><时间>',
                desc: '字面意思',
            },
            {
                icon: 3,
                title: '#解禁<@QQ>',
                desc: '字面意思',
            },
            {
                icon: 4,
                title: '#踢<@QQ>',
                desc: '字面意思',
            },
            {
                icon: 5,
                title: '#获取禁言列表',
                desc: '获取本群被禁言的人',
            },
            {
                icon: 6,
                title: '#改群名<群名>',
                desc: '修改群名',
            },
            {
                icon: 7,
                title: '#改群昵称<昵称>',
                desc: '修改自己在当前群的昵称',
            },
            {
                icon: 24,
                title: '#开启/关闭进群验证',
                desc: '开启进群验证后，新进入的用户需要输入验证码',
            },
            {
                icon: 25,
                title: '#(开启|关闭)加群通知',
                desc: '将加群申请通知发送到群'
            }
        ],
    },
    {
        group: '杂项',
        list: [
            {
                icon: 8,
                title: '#退群<群号>',
                desc: '退出指定群聊',
            },
            {
                icon: 9,
                title: '#看群头像<群号>',
                desc: '发送指定群聊的头像，为空默认当前群',
            },
            {
                icon: 10,
                title: '#看头像<QQ>',
                desc: '发送指定用户头像',
            },
            {
                icon: 11,
                title: '#赞我',
                desc: '给用户点赞',
            },
            {
                icon: 12,
                title: '#设置主人',
                desc: '输入控制台验证码设置主人',
            },
            {
                icon: 14,
                title: 'url编码/解码',
                desc: '特殊字符跟url格式进行互转',
            },
            {
                icon: 15,
                title: 'domain编码/解码',
                desc: 'unicode字符串跟域名进行互转',
            },
            {
                icon: 16,
                title: 'base64编码/解码',
                desc: '字符串进行base64编码/解码',
            },
            {
                icon: 17,
                title: 'md5加密',
                desc: '字符串进行md5加密 加密后不可逆转回原始字符串',
            },
            {
                icon: 18,
                title: 'unicode编码/解码',
                desc: '字符串进行unicode编码/解码',
            },
        ],
    },
    {
        group: 'Bot为群主可用',
        list: [
            {
                icon: 14,
                title: '#申请头衔<头衔>',
                desc: '字面意思',
            },
            {
                icon: 29,
                title: '#设置头衔<@QQ><头衔>',
                desc: '字面意思',
            },
            {
                icon: 15,
                title: '#设置管理<@QQ>',
                desc: '字面意思',
            },
            {
                icon: 16,
                title: '#取消管理<@QQ>',
                desc: '字面意思',
            },
        ],
    },
    {
        group: '主人可用',
        auth: 'master',
        list: [
            {
                icon: 17,
                title: '#开启/关闭进群通知',
                desc: '关闭后不处理当前群的进群通知',
            },
            {
                icon: 18,
                title: '#拉黑/拉白<@用户>',
                desc: '拉黑用户或者拉白用户',
            },
            {
                icon: 19,
                title: '#拉黑/拉白群<群号>',
                desc: '拉黑群或者拉白群',
            },
            {
                icon: 20,
                title: '#取消拉黑/拉白<@用户>',
                desc: '字面意思',
            },
            {
                icon: 21,
                title: '#取消拉黑/拉白群<群号>',
                desc: '字面意思',
            },
            {
                icon: 22,
                title: '#Karin设置(暂时无法使用)',
                desc: '可对Karin的配置文件进行控制',
            },
            {
                icon: 23,
                title: '#上/下班',
                desc: '处于下班群聊将不会处理任何消息',
            },
            {
                icon: 25,
                title: '文件上传/下载',
                desc: '用于上传文件到q群或下载文件到本地',
            },
            {
                icon: 28,
                title: 'rjs+<js代码>',
                desc: '运行js代码，返回运行结果',
            },
            {
                icon: 29,
                title: 'rc+<命令行代码>',
                desc: '运行命令行代码，返回运行结果',
            },
            {
                icon: 30,
                title: 'fm+<任意字符>',
                desc: '发送转发消息',
            },
            {
                icon: 31,
                title: '#新增主人+<@QQ>',
                desc: '新增主人',
            },
            {
                icon: 32,
                title: '#删除主人+<@QQ>',
                desc: '删除主人',
            },
        ],
    },
];
