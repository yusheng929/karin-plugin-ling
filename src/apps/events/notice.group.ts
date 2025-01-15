import { GroupMessage, karin } from 'node-karin'
import { other } from '@/utils/config'
import lodash from 'node-karin/lodash'

/** 进群通知 */
export const accept = karin.accept('notice.groupMemberAdd', async (e) => {
  const cfg = other()
  if (cfg.accept.blackGroup.includes(e.groupId)) return false
  await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true })

  /** 检查是否开启入群验证 */
  if (!cfg.joinGroup.includes(e.groupId)) return true

  for (let i = 1; i <= 3; i++) {
    const num1 = lodash.random(1, 100)
    const num2 = lodash.random(1, 100)
    /** 加乘 不要减、除 过于混乱 */
    const type = lodash.random(1, 2)
    const result = type === 1 ? num1 + num2 : num1 * num2
    await e.reply(`\n为确保你不是机器人\n请在3分钟内输入下方验证码\n『${num1} ${type === 1 ? '+' : '×'} ${num2} = ？』`, { at: true })

    /**
     * @returns 返回`true`继续循环，返回`false`结束循环
     */
    const exit = async (msg: string) => {
      if (i >= 3) {
        await e.reply(`\n${msg}，你将会被踢出群聊`, { at: true })
        await e.bot.groupKickMember(e.groupId, e.userId)
        return false
      }

      await e.reply(`\n${msg}，你还有${3 - i}次机会`, { at: true })
      return true
    }

    const event = await karin.ctx<GroupMessage>(e, { time: 180, reply: false }).catch(() => null)

    if (!event || event.msg.trim() !== result.toString()) {
      const msg = event ? '验证码错误，请重新输入' : '输入超时'
      if (await exit(msg)) continue
      return true
    }

    await e.reply('\n验证通过，欢迎加入群聊', { at: true })
  }

  return true
}, { name: '加群通知' })

/** 退群通知 */
export const unaccept = karin.accept('notice.groupMemberRemove', async (e) => {
  const data = other().accept.blackGroup
  if (data.includes(e.groupId)) return false
  await e.reply(`用户『${e.userId}』丢下我们一个人走了`)
  return true
})
