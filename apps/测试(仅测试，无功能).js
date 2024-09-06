import { karin } from 'node-karin'
// 仅用于开发者测试部分功能实现，无其他作用
export const test = karin.command(/^测试/, async (e) => {
  try {
    e.reply('测试')
    
    // 使用 try...catch 来捕获 ctx 方法可能抛出的错误
    const event = await karin.ctx(e, {
      time: 10,         // 设置超时时间为10秒（为了演示，可以调节时间）
      reply: true,
      replyMsg: '已超时'
    })
    
    // 处理正常情况下的 event
    e.reply('成功接收到事件')
  } catch (error) {
    e.reply(`出现错误: ${error.message}`)
  }
}, { name: '测试', priority: '-1' })