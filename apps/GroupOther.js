import moment from 'node-karin/moment'
import { karin, segment, common } from 'node-karin'

/**
 * 改群名
 */
export const SeeImg = karin.command(/^#改群名/, async (e) => {
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }
  const Name = e.msg.replace(/^#改群名/, '').trim()
  if (!Name) return e.reply('群名不能为空', { at: true })

  try {
    await e.bot.ModifyGroupName(e.group_id, Name)
    e.reply(`已经将群名修改为『${Name}』`)
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
  return true
}, { name: '改群名', priority: '-1' })

/**
 * 获取禁言列表
*/
export const MuteList = karin.command(/^#?(获取|查看)?禁言列表$/, async (e) => {
  const lsit = []
  const res = await e.bot.GetProhibitedUserList(e.group_id)
  if (!res.length) return e.reply('\n没有被禁言的人哦~', { at: true })

  res.forEach((item) => {
    lsit.push([
      segment.image(e.bot.getAvatarUrl(item.uid)),
      segment.text(`\nQQ号: ${item.uid}`),
      segment.text(`\n禁言剩余: ${moment(item.prohibited_time - Date.now()).format('HH:mm:ss')}`),
      segment.text(`\n禁言到期: ${moment(item.prohibited_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`),
    ])
  })

  lsit.unshift(segment.text(`禁言列表如下(共${res.length}人):`))
  const content = common.makeForward(lsit, e.self_id, e.bot.account.name)
  await e.bot.sendForwardMessage(e.contact, content)
  return true
})
