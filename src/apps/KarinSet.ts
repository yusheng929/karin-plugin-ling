// import { karin, config } from 'node-karin'
// import lodash from 'node-karin/lodash'

// const cfgMap: Record<string, string> = {
//   黑名单用户: 'App_BlackList.users',
//   黑名单群: 'App_BlackList.groups',
//   黑名单群日志统计: 'App_BlackList.GroupMsgLog',
//   白名单用户: 'App_WhiteList.users',
//   白名单群: 'App_WhiteList.groups',
//   白名单群日志统计: 'App_WhiteList.GroupMsgLog',
//   群聊消息冷却: 'App_GroupConfig.GroupCD',
//   群聊个人消息冷却: 'App_GroupConfig.GroupUserCD',
//   机器人响应模式: 'App_GroupConfig.mode',
//   机器人前缀: 'App_GroupConfig.alias',
//   白名单功能: 'App_GroupConfig.enable',
//   黑名单功能: 'App_GroupConfig.disable',
//   机器人私聊: 'App_PrivateConfig.enable',
//   日志等级: 'config_log4jsCfg.level',
// }

// const CfgReg = `^#?(Karin|karin|卡琳)设置\\s*(${lodash.keys(cfgMap).join('|')})?\\s*(.*)$`

// export const set = karin.command(CfgReg, async (e) => {
//   const reg = new RegExp(CfgReg).exec(e.msg)
//   if (reg && reg[2]) {
//     let val: string | boolean = reg[3] || ''
//     let cfgKey = cfgMap[reg[2]]
//     if (cfgKey === 'config_log4jsCfg.level') {
//       if (containsAny(val, ['信息', 'INFO'])) {
//         val = 'info'
//       } else if (containsAny(val, ['警告', 'WARN'])) {
//         val = 'warn'
//       } else if (containsAny(val, ['错误', '异常', 'ERROR'])) {
//         val = 'error'
//       } else if (containsAny(val, ['标记', 'mark'])) {
//         val = 'mark'
//       } else if (containsAny(val, ['追踪', 'trace'])) {
//         val = 'trace'
//       } else if (containsAny(val, ['调试', 'debug'])) {
//         val = 'debug'
//       } else if (containsAny(val, ['致命', 'fatal'])) {
//         val = 'fatal'
//       } else if (containsAny(val, ['关闭', 'off'])) {
//         val = 'off'
//       } else {
//         e.reply('请输入正确的日志等 级，可选：\n追踪(trace), 调试(debug), 信息(info), 警告(warn), 致命(fatal), 标记(mark), 错误(error), 关闭(off)', { reply: true })
//         return true
//       }
//     } else if (val.includes('开启') || val.includes('关闭')) {
//       val = !/关闭/.test(val)
//     } else {
//       cfgKey = ''
//     }

//     if (cfgKey) {
//       setCfg(cfgKey, val)
//     }
//   }

//   const cfg: Record<string, any> = {}
//   for (const name in cfgMap) {
//     const key = cfgMap[name].split('_')[1].replace('.', '_')
//     cfg[key] = getStatus(cfgMap[name])
//   }

//   // 渲染图像
//   const base64 = await Render.render('admin/index', {
//     ...cfg,
//     scale: 1,
//     copyright: 'Karin'
//   })

//   await e.reply(base64)
//   return true
// }, { permission: 'master' })

// const setCfg = function (rote: string, value: string | number | boolean | object, def = false) {
//   const arr = rote?.split('_') || []
//   if (arr.length > 0) {
//     const type = arr[0]; const name = arr[1]
//     Config.save(type, def ? 'defSet' : 'config', name, value)
//   }
// }

// const getStatus = function (rote: string, def = false) {
//   let _class = 'cfg-status'
//   let value = ''
//   const arr = rote?.split('_') || []
//   if (arr.length > 0) {
//     const type = arr[0]; const name = arr[1]
//     const data = Cfg.getYaml(def ? 'defSet' : 'config', type) || {}
//     const keys = name.split('.')
//     let datas = data
//     for (const types of keys) {
//       datas = datas[types]
//     }
//     if (datas === true || datas === false) {
//       _class = datas === false ? `${_class}  status-off` : _class
//       value = datas === true ? '已开启' : '已关闭'
//     } else {
//       value = datas
//     }
//   }
//   if (!value) {
//     _class = `${_class}  status-off`
//     value = '已关闭'
//   }

//   return `<div class="${_class}">${value}</div>`
// }

// function containsAny (str: string, substrings: any[]) {
//   return substrings.some(substring =>
//     str.toLowerCase().includes(substring.toLowerCase())
//   )
// }
