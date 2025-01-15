import { karin, config, logger } from 'node-karin'

/**
 * 给全部主人、管理员发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export const sendToAllAdmin = async (selfId: string, message: Parameters<typeof karin.sendMsg>[2]
) => {
  const list = [...config.master(), ...config.admin()]
  for (const id of list) {
    try {
      const contact = karin.contactFriend(id)
      await karin.sendMsg(selfId, contact, message)
    } catch (error) {
      logger.bot('info', selfId, `[${id}] 发送主动消息失败:`)
      logger.error(error)
    }
  }
}
