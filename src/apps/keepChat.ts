import lodash from 'node-karin/lodash'
import { cof, pkg } from '@/utils/config'
import { karin, logger } from 'node-karin'

export const keepChat = karin.task('续火', cof().cron || '0 0 * * *', async () => {
  const count = {
    /** 群聊成功 */
    group: 0,
    /** 好友成功 */
    friend: 0,
    /** 群聊失败 */
    groupError: 0,
    /** 好友失败 */
    friendError: 0,
  }

  const cfg = cof()
  if (!cfg.enable) {
    logger.debug(`[${pkg().name}] 续火功能未启用`)
    return
  }

  for (const v of Array.isArray(cfg.group) ? cfg.group : []) {
    try {
      const [selfId, groupId] = v.split(':')
      if (!selfId || !groupId) continue
      const contact = karin.contactGroup(groupId)
      const msg = lodash.sample(cfg.msg)
      if (msg) {
        await karin.sendMsg(selfId, contact, msg)
        count.group++
      }
    } catch (error) {
      logger.error(`[${pkg().name}] 续火群聊失败: ${v}`)
      count.groupError++
    }
  }

  for (const v of Array.isArray(cfg.friend) ? cfg.friend : []) {
    try {
      const [selfId, friendId] = v.split(':')
      if (!selfId || !friendId) continue
      const contact = karin.contactFriend(friendId)
      const msg = lodash.sample(cfg.msg)
      if (msg) {
        await karin.sendMsg(selfId, contact, msg)
        count.friend++
      }
    } catch (error) {
      logger.error(`[${pkg().name}] 续火好友失败: ${v}`)
      count.friendError++
    }
  }

  // 先这样 后面发给主人
  logger.info(`[${pkg().name}] 续火完成: 群(${count.group}/${count.groupError + count.group}) 好友(${count.friend}/${count.friendError + count.friend})`)
})
