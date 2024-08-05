import { karin, logger, segment, common } from 'node-karin'

/**
 * 退群
 */
export const QuitGroup = karin.command(/^#?退群/, async (e) => {
let groupId = e.msg.replace(/#?退群/g, "").trim()

    if (!groupId) return e.reply("群号不能为空")

    if (!/^\d+$/.test(groupId)) return e.reply("请输入正确的群号")
    const res = await e.bot.GetGroupInfo(groupId)
    if (!res) {
      await e.reply('\n你好像没加入这个群', { at: true })
      return true
    }
  try {
  if (groupId == e.group_id) {
     await e.reply("3秒后退出本群聊")
      await common.sleep(3000)
      }
    await e.bot.LeaveGroup(groupId)
    e.reply(`已退出群聊『${groupId}』`)
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
  return true
}, { name: "退群", priority: "-1" })