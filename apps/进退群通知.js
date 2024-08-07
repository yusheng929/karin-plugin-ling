import { karin, redis } from 'node-karin'
import { Config, YamlReader } from '../lib/index.js'
let cfgPath = 'plugins/karin-plugin-group/config/config/other.yaml'
/**
 * 进群通知
 */
export const accept = karin.accept('notice.group_member_increase', async (e) => {
   if (Config.Other.accept.BlackGroup.some(i => i === e.group_id)) return false
   if (e.user_id == e.bot.uin) return;
   const key = `Karin:newcomers:${e.group_id}`;
    if (await redis.get(key)) return;
    await redis.set(key, "1", { EX: Config.Other.accept.cd });
  await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true })
  return true
}, { name: "进群通知", priority: "-1" })

/**
 * 退群通知
*/
export const unaccept = karin.accept('notice.group_member_decrease', async (e) => {
   if (Config.Other.accept.BlackGroup.some(i => i === e.group_id)) return false
  await e.reply(`用户『${e.user_id}』丢下我们一个人走了(╥_╥)`)
  return true
}, { name: "退群通知", priority: "-1"})

export const CloseNotification = karin.command(/^#关闭进群通知/, async (e) => {
  let group_id = e.msg.replace(/#关闭进群通知/g, '').trim()
  if (!group_id) group_id = e.group_id
  if (!/^\d+$/.test(group_id)) return e.reply('请输入正确的群号')
   try {
      const yaml = new YamlReader(cfgPath)
      const data = yaml.get('accept.BlackGroup')
      if (!data?.includes?.(group_id)) {
        if (!data || !Array.isArray(data)) {
          yaml.set('accept.BlackGroup', [ group_id ])
        } else {
          yaml.addIn('accept.BlackGroup', group_id)
        }
        await e.reply(`已经关闭群『${group_id}』的进群通知`)
      } else {
        await e.reply(`群『${group_id}』的进群通知已经处于关闭状态啦！`)
      }
    } catch (error) {
      await e.reply(`失败: 未知错误❌`)
      logger.error(error)
    }
}, { name: "关闭进群通知", priority: "-1", permission: "master" })

export const ActivateNotification = karin.command(/^#开启进群通知/, async (e) => {
  let group_id = e.msg.replace(/#开启进群通知/g, '').trim()
  if (!group_id) group_id = e.group_id
  if (!/^\d+$/.test(group_id)) return e.reply('请输入正确的群号')
   try {
      const yaml = new YamlReader(cfgPath)
      const data = yaml.get('accept.BlackGroup')
      if (Array.isArray(data) && data.includes(group_id)) {
        Config.modify('other', 'accept.BlackGroup', group_id)
        await e.reply(`已经开启群『${group_id}』的进群通知`)
      } else {
        await e.reply(`群${group_id}的进群通知已经处于开启状态啦！`)
      }
    } catch (error) {
      await e.reply(`错误:未知原因❌`)
      logger.error(error)
    }
}, { name: "关闭进群通知", priority: "-1", permission: "master" })