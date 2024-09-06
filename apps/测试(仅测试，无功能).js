import { karin } from 'node-karin'
// 仅用于开发者测试部分功能实现，无其他作用
export const test = karin.command(/^测试/, async (e) => {
  let num = 2
  let user_id = e.user_id
  await e.reply(`\n为确保你不是机器人\n请在3分钟内输入下方验证码\n『${num}』`, { at: true })
  try {
  for (let i = 3; i >= 0; i--) {
   const event = await karin.ctx(e, { time: 10, reply: false})
   if (!(event.msg == num) && (i == 1) {
   await e.reply('验证失败，你将会被踢出群聊', { at: true })
   return true
   }
  if (event.msg == num) {
  await e.reply('\n验证通过，欢迎加入群聊', { at: true })
  return true
  } else {
   await e.reply(`验证码错误，请重新输入\n你还有${i - 1}次机会`)
  }
}
} catch (error) {
  await e.reply('输入超时，你将会被踢出群聊', { at: true })
  return true
  }
}, { name: '测试', priority: '-1' })