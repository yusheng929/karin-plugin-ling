import { cfg } from '@/config'
import { sendToAllAdmin, sendToFirstAdmin } from '@/utils/common'
import { karin, logger, redis, segment } from 'node-karin'

/** 处理好友申请 */
export const friendApply = karin.accept('request.friendApply', async (e) => {
  logger.info(`${e.content.applierId} 申请加好友: ${e.content.flag}`)
  const opt = (await cfg.getFriend()).Apply
  if (e.isMaster) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
    logger.info('已同意加好友申请')
    return true
  }
  if (opt.autoAgree) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
    logger.info('已自动同意加好友申请')
  }
  if (!opt.notify.enable) return true
  const AvatarUrl = await e.bot.getAvatarUrl(e.userId)
  const message = [
    segment.image(AvatarUrl),
    segment.text([
      '接到用户好友申请',
      `QQ号: ${e.userId}`,
      `昵称: ${e.sender.nick || '未知'}`,
      `${opt.autoAgree ? '已自动同意' : '可引用回复: 同意/拒绝进行处理'}`
    ].join('\n'))
  ]
  if (!opt.notify.allow) {
    await sendToAllAdmin(e.selfId, message)
  } else {
    await sendToFirstAdmin(e.selfId, message)
  }
  if (!opt.autoAgree) {
    const key = `Ling:friendapply:${e.userId}`
    redis.set(key, e.content.flag, { EX: 86400 })
  }
  return true
}, { name: '处理加好友申请', priority: 100, })
