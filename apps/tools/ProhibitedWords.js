import { logger } from 'node-karin'
import { Config } from '#components'

const ProhibitedWords = async (e) => {
  if (!e.isGroup) {
    logger.debug('不在群聊，跳过监听')
    return false
  }
  let data = Config.GroupYaml
  let rules = (data[`${e.group_id}`] && data[`${e.group_id}`]['enable']) || ''
  if (!rules) return false
  let words = data[`${e.group_id}`]['words']
  let match = data[`${e.group_id}`]['rule']
  if (match == 0 && words.some(word => e.msg.includes(word))) {
    if ((['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    return false
    } else {
    await e.bot.RecallMessage(e.contact, e.message_id)
    await e.reply('请不要发布违规内容', {at: true})
    return true
    }
  }
  if (match == 1 && words.some(word => e.msg === word)) {
    if ((['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    return false
    } else {
    await e.bot.RecallMessage(e.contact, e.message_id)
    await e.reply('请不要发布违规内容', {at: true})
    return true
    }
  }
}

export default {
  ProhibitedWords,
}
