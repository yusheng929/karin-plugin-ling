import { karin, segment, common, level } from 'node-karin'
import { Edit, Config, Version } from '#components'
import { 编辑文件 } from '#lib'
import fs from 'fs'
import YAML from 'yaml'

export const 黑白名单 = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  let id
  if (!e.msg.includes('群')) {
    id = e.at.length ? e.at[0] : e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()
  } else {
    id = e.msg.replace(/#(取消)?(拉黑|拉白)群/, '').trim() || e.group_id
  }

  if (!id) return e.reply('请输入正确的账号')

  const type = e.msg.includes('拉白') ? 'White' : 'Black'
  const isRemoval = e.msg.includes('取消')
  const targetType = e.msg.includes('群') ? 'Group' : 'User'

  return await 编辑文件.编辑黑白名单(e, type, isRemoval, targetType, id)
}, { name: '取消拉黑拉白群', priority: '-1', permission: 'master' })
export const 撤回 = karin.command(/^#?撤回$/, async (e) => {
 if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  e.bot.RecallMessage(e.contact, e.reply_id)
  e.bot.RecallMessage(e.contact, e.message_id)
}, { name: '撤回', priority: '-1' })
export const 清屏撤回 = karin.command(/^#清屏(\d+)?/, async (e) => {
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }

  let match = e.msg.replace(/#清屏/, '').trim() || 50
  let msg_ids = await e.bot.GetHistoryMessage(e.contact, e.message_id, match)
  let msg_id_list = msg_ids.map(item => item.message_id)
 await e.reply('开始执行清屏操作，请确保我有管理员')
  for (const msg_id of msg_id_list) {
    await e.bot.RecallMessage(e.contact, msg_id)
  }
}, { name: '清屏', priority: '-1' })

export const QuitGroup = karin.command(/^#?退群/, async (e) => {
  const group_id = e.msg.replace(/#?退群/g, '').trim() || e.group_id

  try {
    await e.bot.GetGroupInfo(group_id)
  } catch (error) {
    await e.reply('\n你好像没加入这个群', { at: true })
    return true
  }

  try {
    if (group_id === e.group_id) {
      await e.reply('3秒后退出本群聊')
      await common.sleep(3000)
      await e.bot.LeaveGroup(group_id)
    } else {
      await e.reply(`已退出群聊『${group_id}』`)
    }

    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
}, { name: '退群', priority: '-1', permission: 'master' })

/**
 * 看群头像
**/
export const SeeImg = karin.command(/^#(看|取)头像/, async (e) => {
  const userId = e.at.length ? e.at[0] : e.msg.replace(/#(看|取)头像/, '').trim()
  if (!userId) {
    await e.reply('请指定用户', { at: true })
    return true
  }

  const Img = e.bot.getAvatarUrl(userId, 640)
  await e.reply(segment.image(Img))
  return true
}, { name: '看头像', priority: '-1' })

/**
 * 看群头像
 */
export const SeeGroupImg = karin.command(/^#(看|取)群头像/, async (e) => {
  const group_id = e.msg.replace(/^#?(看|取)群头像/, '').trim() || e.group_id
  if (!group_id) return e.reply('请输入正确的群号')
  const Img = e.bot.getGroupAvatarUrl(group_id, 640)
  await e.reply(segment.image(Img))
  return true
}, { name: '看群头像', priority: '-1' })

export const command = karin.command(/^#赞我$/, async e => {
  const key = `VoteUser:${e.user_id}`
  const time = await level.get(key)
  if (time) {
    //  检查是否为今天
    if (new Date().toDateString() === new Date(Number(time)).toDateString()) {
      e.reply(
        [
          segment.at(e.user_id, e.user_id),
          ' 今天已经赞过了o(￣▽￣)ｄ',
        ])
      return true
    }
  }

  let count = 10
  const res = await e.bot.VoteUser(e.user_id, 10)
  // 先点10次 看下是否成功
  if (res.status === 'ok') {
    // 继续尝试点10次
    try {
      const res = await e.bot.VoteUser(e.user_id, 10)
      if (res) count += 10
    } catch { }
  }

  if (!res) {
    await e.reply('点赞失败了o(╥﹏╥)o', { at: true })
    return true
  }

  // 成功后记录时间
  await level.set(key, Date.now())
  await e.reply(`\n已经成功为你点赞${count}次！`, { at: true })
  return true
}, { name: '赞我', priority: '-1' })
export const 群发 = karin.command(/^#群发/, async (e) => {
  let msg = e.msg.replace(/#群发/, '').trim()
  if (!msg && !e.reply_id) return e.reply('请带上需要发送的消息')
  if (!msg && e.reply_id) {
   let data = await e.bot.GetMessage(e.contact, e.reply_id)
   msg = data.elements[0].text
  }
  const elements = [
  segment.text(msg)
]
  let group_list = await e.bot.GetGroupList()
  let group_id_list = group_list.map(item => item.group_id)
  console.log(group_id_list)
 for (const group_id of group_id_list) {
   try {
      const contact = karin.contactGroup(group_id);
      await e.bot.SendMessage(contact, elements);
   } catch (error) { }
  }
  e.reply('发送完成')
  return true
}, { name: '群发', priority: '-1', permission: 'master' })
export const ProhibitedWords = karin.command(/^#(添加|删除|查看|开启|关闭)(所有)?违禁词/, async (e) => {
if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) return e.reply('暂无权限，只有管理员才能操作')
let data = Config.GroupYaml
if (e.msg.includes('查看')) {
if (e.msg.includes('所有')) {
if (!e.isMaster) return e.reply('暂无权限，只有主人才能操作')
let msgs = []
for (const key in data) {
  if (data.hasOwnProperty(key)) {
    let type = data[key]['enable']
    let ruleid = data[key]['rule']
    let rule = ruleid == 0 ? '模糊拦截' : '精准拦截'
    let words = (data[key]['words']).join('\n')
    msgs.push([
    segment.text(`id: ${key}`),
    segment.text(`\n是否启用: ${type}`),
    segment.text(`\n拦截规则: ${rule}`),
    segment.text(`\n违禁词列表: \n${words}`),
    ])
  }
}
  const msg = common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
let datas = e.group_id
datas = data[`${datas}`] ? e.group_id : 'default'
let rules = (data[`${datas}`] && data[`${datas}`]['words']) || ''
if (!rules) return e.reply('暂无违禁词')
let rule = rules.join('\n')
let msgs = []
let type = data[`${datas}`]['enable']
let types = data[`${datas}`]['rule']
let typess = types == 0 ? '模糊拦截' : '精准拦截'
msgs.push([segment.text(`是否启用: ${type}`)])
msgs.push([segment.text(`拦截规则: ${typess}`)])
msgs.push([segment.text(`违禁词: \n${rule}`)])
if (datas == 'default') msgs.unshift(segment.text(`当前群为配置违禁词，将使用默认违禁词`))
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
if (e.msg.includes('开启')) {
let rules = data[`${e.group_id}`] || ''
if (!rules) await Edit.EditTest(e)
  return await Edit.EditSet(e, '已开启当前群违禁词拦截', '已经处于开启状态', `${e.group_id}.enable`, true, 'group')
  }
if (e.msg.includes('关闭')) {
let rules = data[`${e.group_id}`] || ''
if (!rules) await Edit.EditTest(e)
  return await Edit.EditSet(e, '已关闭当前群违禁词拦截', '已经处于关闭状态', `${e.group_id}.enable`, false, 'group')
  }
 let word = e.msg.replace(/#(添加|删除|查看|开启|关闭)(所有)?违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = `${e.group_id}.words`
   let rules = data[`${e.group_id}`] || ''
 if (!rules) {
 await Edit.EditTest(e)
 }
  if (e.msg.includes('添加')) {
  return await Edit.EditAddend(e, '添加成功', '已经添加过了', term, word, 'group')
  }
  if (e.msg.includes('删除')) {
  return await Edit.EditRemove(e, '删除成功', '没有这个违禁词', term, word, 'group')
  }
}, { name: '违禁词', priority: '-1' })
export const DefaultProhibitedWords = karin.command(/^#(添加|删除|查看|开启|关闭)默认违禁词/, async (e) => {
let data = Config.GroupYaml
if (e.msg.includes('查看')) {
let rules = (data['default'] && data['default']['words']) || ''
if (!rules) return e.reply('暂无违禁词')
let rule = rules.join('\n')
let msgs = []
let type = data['default']['enable']
let types = data['default']['rule']
let typess = types == 0 ? '模糊拦截' : '精准拦截'
msgs.push([segment.text(`是否启用: ${type}`)])
msgs.push([segment.text(`拦截规则: ${typess}`)])
msgs.push([segment.text(`违禁词: \n${rule}`)])
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
if (e.msg.includes('开启')) return await Edit.EditSet(e, '已开启默认违禁词拦截', '已经处于开启状态', 'default.enable', true, 'group')
if (e.msg.includes('关闭')) return await Edit.EditSet(e, '已关闭默认违禁词拦截', '已经处于关闭状态', 'default.enable', false, 'group')
 let word = e.msg.replace(/#(添加|删除|查看|开启|关闭)默认违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = 'default.words'
  if (e.msg.includes('添加')) return await Edit.EditAddend(e, '添加成功', '已经添加过了', term, word, 'group')
  if (e.msg.includes('删除')) return await Edit.EditRemove(e, '删除成功', '没有这个违禁词', term, word, 'group')
}, { name: '全局违禁词', priority: '-1', permission: 'master' })
export const Botprefix = karin.command(/^#(添加|删除|查看)(所有)?前缀/, async (e) => {
   if (e.msg.includes('查看')) {
   if (e.msg.includes('所有')) {
  const data = fs.readFileSync('config/config/group.yaml', 'utf8')
  const datas = YAML.parse(data)
  const Default = datas.default
  const botKeys = Object.keys(datas).filter(key => key.startsWith('Bot:'))
  
  let msgs = []

  for (const key of botKeys) {
    if (key === 'Bot:self_id' || key === 'Bot:self_id:group_id') {
      continue
    }
    
    const rest = key.substring(4)
    
    if (rest.includes(':')) {
      let [id, group_id] = rest.split(':')
      let mode = datas[key].mode
      let alias = datas[key].alias
      msgs.push([
        segment.text(`Bot: ${id}`),
        segment.text(`\n群: ${group_id}`),
        segment.text(`\n前缀状态: ${mode === 0 ? "无前缀所有人可响应" : mode === 1 ? "仅响应艾特Bot" : mode === 2 ? "仅响应主人" : mode === 3 ? "仅回应前缀" : mode === 4 ? "仅响应前缀和艾特Bot" : mode === 5 ? "主人无前缀，其余人需前缀或者艾特Bot" : "未知"}`),
        segment.text(`\n前缀:\n ${alias || ''}`)
      ])
    } else {
      const id = rest
      let mode = datas[key].mode
      let alias = datas[key].alias
      msgs.push([
        segment.text(`Bot: ${id}`),
        segment.text(`\n群: 所有群均使用该规则`),
        segment.text(`\n前缀状态: ${mode === 0 ? "无前缀所有人可响应" : mode === 1 ? "仅响应艾特Bot" : mode === 2 ? "仅响应主人" : mode === 3 ? "仅回应前缀" : mode === 4 ? "仅响应前缀和艾特Bot" : mode === 5 ? "主人无前缀，其余人需前缀或者艾特Bot" : "未知"}`),
        segment.text(`\n前缀:\n ${alias || ''}`)
      ])
    }
  }
  msgs.unshift([
    segment.text('全局默认配置:'),
    segment.text(`\n前缀状态: ${Default.mode === 0 ? "无前缀所有人可响应" : Default.mode === 1 ? "仅响应艾特Bot" : Default.mode === 2 ? "仅响应主人" : Default.mode === 3 ? "仅回应前缀" : Default.mode === 4 ? "仅响应前缀和艾特Bot" : Default.mode === 5 ? "主人无前缀，其余人需前缀或者艾特Bot" : "未知"}`),
    segment.text(`\n前缀: \n${Default.alias || ''}`)
  ])

  const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
  return await e.bot.sendForwardMessage(e.contact, msg)
  }
}
}, { name: '前缀', priority: '-1', permission: 'master' })
export const 发好友 = karin.command(/^#发好友/, async (e) => {
  let msg = e.msg.replace(/#发好友/, '').trim()
  if (!msg && !e.reply_id) return e.reply('请带上需要发送的消息')
  if (!msg && e.reply_id) {
   let data = await e.bot.GetMessage(e.contact, e.reply_id)
   msg = data.elements[0].text
  }
  const elements = [
  segment.text(msg)
]
  let friend_list = await e.bot.GetFriendList()
  let firend_id_list = friend_list.map(item => item.uid)
 for (const friend_id of friend_id_list) {
   try {
      const contact = karin.contactFriend(friend_id)
      await e.bot.SendMessage(contact, elements)
   } catch (error) { }
  }
  e.reply('发送完成')
  return true
}, { name: '发好友', priority: '-1', permission: 'master' })
export const 获取群列表 = karin.command(/^#(查看|获取|保存)(群|好友)列表$/, async (e) => {
let msgs = []
let path = `${Version.pluginPath}/resources/List`
if (e.msg.includes('群')) {
 let group_list = await e.bot.GetGroupList()
 let data = group_list.map((item, index) => `${index + 1}. ${item.group_name} (${item.group_id})`).join('\n')
 if (e.msg.includes('保存')) {
   if (fs.existsSync(`${path}Group_List.txt`)) {
   e.reply('检测到已存在群名单文件，你可以执行以下操作:\n覆盖\n添加')
   const event = await karin.ctx(e)
   if (event.msg == '覆盖') {
    await fs.promises.writeFile(`${path}/Group_List.txt`, data)
    return e.reply(`文件已保存，可执行\n#上传群名单\n来上传文件`)
    } else {
    if (event.msg == '添加') {
    await fs.promises.appendFile(`${path}/Group_List.txt`, data)
     return e.reply(`文件已保存，可执行\n#上传群名单\n来上传文件`)
    } else return await e.reply('指令错误，退出操作')
    }
  } else {
  await fs.promises.writeFile(`${path}/Group_List.txt`, data)
     return e.reply(`文件已保存，可执行\n#上传群名单\n来上传文件`)
  }
}
msgs.push(segment.text(data))
msgs.push(segment.text("可使用 *#退群1234567890* 来退出群聊"))
msgs.unshift(segment.text(`群列表如下: 总共${group_list.length}个群`))
}
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
  return await e.bot.sendForwardMessage(e.contact, msg)
}, { name: '获取群列表', priority: '-1', permission: 'master' })
export const 上传名单 = karin.command(/^#上传(群|好友)名单$/, async (e) => {
let path = `${Version.pluginPath}/resources/List`
let txtPath = `${path}/${e.msg.includes('群') ? 'Group_List.txt' : 'Friend_List.txt'}`
if (e.isGroup){
if (!(fs.existsSync(txtPath))) return e.reply('你还未保存文件，请先执行\n#保存(群|好友)列表')
return e.bot.UploadPrivateFile(e.group_id, txtPath, `${e.msg.includes == '群' ? 'Group_List.txt' : 'Friend_List.txt'}`)
} else {
if (!(fs.existsSync(txtPath))) return e.reply('你还未保存文件，请先执行\n#保存(群|好友)列表\n')
return e.bot.UploadPrivateFile(e.group_id, txtPath, `${e.msg.includes == '群' ? 'Group_List.txt' : 'Friend_List.txt'}`)
}
}, { name: '上传群好友列表', priority: '-1', permission: 'master' })