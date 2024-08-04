import { Version, App } from '../lib/index.js'
import { logger } from 'node-karin'

export const app = {
  id: 'update',
  name: '更新插件',
  priority: 50
}

export const rule = {
  update: {
    reg: /^#群管(插件)?(强制)?更新(日志)?$/,
    fnc: update
  }
}

export const updateApp = new App(app, rule).create()

function update (e) {
  let msg = e.msg
  if (!msg.includes('日志') && !e.isMaster) return false
  if (msg.includes('强制') && msg.includes('日志')) {
    msg = msg.replace('强制', '')
  }
  msg = msg.replace(/群管(插件)?/, '')
  msg += Version.pluginName.replace('karin-plugin-', '')
  e.msg = msg
  return false
}