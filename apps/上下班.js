import { karin, YamlEditor } from 'node-karin'
import { Config, Edit } from '#components'
const cfgPath = './plugins/karin-plugin-ling/config/config/other.yaml'

export const use = karin.use('recvMsg', async (e, next, exit) => {
  if (e.msg.includes('上班') || e.msg.includes('下班')) return false
  if (Config.Other.NoWork == e.group_id) return exit()

  next()
})

export const test = karin.command(/^#(上班|下班)$/, async (e) => {
  if (e.msg.includes('上班')) {
    return await Edit.EditDel(e, '开始上班(T^T)', '已经是上班状态咯~', 'NoWork', e.group_id, 'other')
  }

  if (e.msg.includes('下班')) {
  return await Edit.EditAdd(e, '下班咯~', '已经是下班状态咯~', 'NoWork', e.group_id, 'other')
  }
}, { permission: 'master' })
