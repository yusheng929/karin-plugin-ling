import { karin } from 'node-karin'
// 仅用于开发者测试部分功能实现，无其他作用(请勿使用，后果自负)
export const test = karin.command(/^测试/, async (e) => {
  await cs(e)
  await css(e)
}, { name: '测试', priority: '-1' })
const cs = async(e) => {
 e.reply('1')
 return true
}
const css = async(e) => {
 e.reply('2')
 return true
}