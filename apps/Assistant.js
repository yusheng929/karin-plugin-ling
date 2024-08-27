import { karin, YamlEditor, config } from 'node-karin'
import { 编辑文件 } from '#lib'

export const 黑白名单 = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  let id
  if (!e.msg.includes('群')) {
    id = e.at.length ? e.at[0] : e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()
  } else {
    id = e.msg.replace(/#(取消)?(拉黑|拉白)群/, '').trim() || e.group_id
  }

  if (!id) return e.reply('请输入正确的账号')

  const type = e.msg.includes('拉白') ? 'White' : 'Black'
  const isRemoval = e.msg.includes('取消')
  const targetType = e.msg.includes('群') ? 'Group' : 'User'

  return await 编辑文件.编辑黑白名单(e, type, isRemoval, targetType, id)
}, { name: '取消拉黑拉白群', priority: '-1', permission: 'master' })

export const 修改日志等级 = karin.command(/^#(修改|设置)日志等级/, async (e) => {
  const 日志等级列表 = ['trace', 'debug', 'info', 'warn', 'fatal', 'mark', 'error', 'off']
  const 日志等级 = e.msg.replace(/^#?(设置|修改)日志等级/, '').trim()
  if (!日志等级列表.includes(日志等级)) return e.reply('❎ 请输入正确的参数，可选：\ntrace,debug,info,warn,fatal,mark,error,off')
  return await 编辑文件.编辑文件(e, 'config.yaml', 日志等级, 'log4jsCfg.level', '日志等级')
}, { name: '修改日志等级', priority: '-1', permission: 'master' })