import { karin, redis } from 'node-karin'
import { Config } from '../lib/index.js'

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
})

/**
 * 退群通知
*/
export const unaccept = karin.accept('notice.group_member_decrease', async (e) => {
   if (Config.Other.accept.BlackGroup.some(i => i === e.group_id)) return false
  await e.reply(`用户『${e.user_id}』丢下我们一个人走了(╥_╥)`)
  return true
})