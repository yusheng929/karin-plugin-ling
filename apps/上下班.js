import { karin, YamlEditor } from 'node-karin'
import { Config } from '#components'
const cfgPath = './plugins/karin-plugin-ling/config/config/other.yaml'

export const use = karin.use('recvMsg', async (e, next, exit) => {
  if (e.msg.includes('上班') || e.msg.includes('下班')) return false
  if (Config.Other.NoWork == e.group_id) return exit()

  next()
})

export const test = karin.command(/^#(上班|下班)$/, async (e) => {
  if (e.msg.includes('上班')) {
    return await EditWork(e, 'remove', '开始上班(T^T)', '已经是上班状态咯~')
  }

  if (e.msg.includes('下班')) {
  return await EditWork(e, 'add', '下班咯~', '已经是下班状态咯~')
  }
}, { permission: 'master' })
const EditWork = async (e, type, onMsg, offMsg) => {

  try {
    const yaml = new YamlEditor(cfgPath)
    const data = yaml.get('NoWork')
    if (!Array.isArray(data)) {
      await e.reply('\n配置文件格式错误❌', { at: true })
      return true
    }

    if ((type === 'add' && data.includes(e.group_id)) || (type === 'remove' && !data.includes(e.group_id))) {
      await e.reply(onMsg)
      return true
    }

    if (type === 'add') {
      yaml.append('NoWork', String(e.group_id))
    } else {
      const res = yaml.remove('NoWork', String(e.group_id))
      if (!res) {
        await e.reply('失败: 未知错误❌')
        return true
      }
    }
    yaml.save()
    await e.reply(onMsg)
    return true
  } catch (error) {
    await e.reply('失败: 未知错误❌')
    logger.error(error)
    return true
  }
}
