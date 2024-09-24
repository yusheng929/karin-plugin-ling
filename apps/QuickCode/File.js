import { karin, segment, common } from 'node-karin'
import fs from 'fs'
import path from 'path'
export const FileDownload = karin.command(/^文件下载/, async (e) => {
e.reply('请发送文件', {at: true})
const event = await karin.ctx(e)
let file = JSON.parse(event.msg)
let Path = `${e.msg.replace(/文件下载/, '').trim() || process.cwd()}/${file.name}`
if (!(file.type === 'file')) return e.reply('未识别到文件，取消操作', {at: true})
let url
  if (!e.isGroup) {
  url = await e.bot.super.pickFriend(e.user_id).getFileUrl(file.fid)
  } else {
  url = await e.bot.super.pickGroup(e.group_id).getFileUrl(file.fid)
  }
  if (!url) return e.reply('获取链接失败', {at: true})
  await e.reply(`检测到文件，开始下载...\n文件的链接为:\n${url}\n保存的路径为:\n${Path}`)
   try {
   await common.downFile(url, Path)
   await e.reply('安装完成')
   } catch (error) {
   logger.error(`文件下载错误：${error.message}`)
   await e.reply(`文件下载错误：${error.message}`, true)
   }
}, { name: '文件下载', priority: '-1', permission: 'master' })
export const UploadDownload = karin.command(/^文件上传/, async (e) => {
let Path = e.msg.replace(/文件上传/, '').trim()
if (!Path) {
e.reply('请发送路径', {at: true})
const event = await karin.ctx(e)
 Path = event.msg
}
 if (!(fs.existsSync(Path))) return e.reply('文件不存在',true)
 await e.reply('开始上传文件',true)
try {
   let name = path.basename(Path)
   if (e.isGroup) {
   await e.bot.UploadGroupFile(e.group_id, Path, name)
   } else {
   await e.bot.UploadPrivateFile(e.user_id, Path, name)
   }
   await e.reply('上传完成',true)
} catch (error) {
   logger.error(`文件上传错误：${error.message}`)
   await e.reply(`文件上传错误：${error.message}`, true)
   }
}, { name: '文件上传', priority: '-1', permission: 'master' })
