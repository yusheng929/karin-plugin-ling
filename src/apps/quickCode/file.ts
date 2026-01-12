import fs from 'node:fs'
import path from 'node:path'
import { common, GroupFileUploadedNotice, karin, logger, PrivateFileUploadedNotice } from 'node-karin'
import { Size } from '@/models/Size'
import { LING_KEY } from '@/utils/common'
import { D } from 'node_modules/node-karin/dist/types-hAhbXJDZ'

const FileDownloadReg = /^#(取消)?文件下载(.*)?$/
const FileUploadReg = /^#文件上传(.*)?$/
export const FileDownload = karin.command(FileDownloadReg, async (e) => {
  let [, cancel, Path = process.cwd()] = e.msg.match(FileDownloadReg)!
  if (cancel) {
    const key = `${e.isGroup ? LING_KEY.GroupUploadFile : LING_KEY.FriendUploadFile}:${e.selfId}:${e.contact.peer}:${e.userId}`
    const event = karin.emit(key, null)
    if (event) {
      await e.reply('已取消文件下载', { reply: true })
    }
    return true
  }
  await e.reply('请在三分钟内发送需要下载到本地的文件', { reply: true })
  const key = `${e.isGroup ? LING_KEY.GroupUploadFile : LING_KEY.FriendUploadFile}:${e.selfId}:${e.contact.peer}:${e.userId}`
  const timeout = setTimeout(async () => {
    karin.emit(key, null)
    await e.reply('文件下载已超时', { reply: true })
  }, 3 * 60 * 1000)
  await karin.once(key, async (event?: GroupFileUploadedNotice | PrivateFileUploadedNotice) => {
    try {
      if (timeout) clearTimeout(timeout)
      if (!event) return false
      await event.reply('开始下载文件', { reply: true })
      let url
      if (event.bot.adapter.protocol === 'napcat') {
        const param: {
          group_id?: number
          file_id: string
        } = {
          file_id: event.content.fid
        }
        let action
        if (event.contact.scene === 'group') {
          param.group_id = +event.contact.peer
          action = 'get_group_file_url'
        } else {
          action = 'get_private_file_url'
        }
        url = (await event.bot.sendApi!(action, param)).url
      } else {
        url = await event.bot.getFileUrl(event.contact, event.content.fid)
      }
      if (!url) {
        await event.reply('获取文件链接失败', { reply: true })
        return true
      }
      Path = path.join(Path, event.content.name || Date.now().toString())
      await common.downFile(url, Path)
      await event.reply('文件下载完成' + `\n文件下载链接: ${url}`, { reply: true })
    } catch (error: any) {
      logger.error(`文件下载错误：${error}`)
      await e.reply(`文件下载错误: ${error.message}`, { reply: true })
    }
  })
  return true
}, { name: '文件下载', priority: -1, permission: 'master' })

export const UploadDownload = karin.command(FileUploadReg, async (e) => {
  let Path = e.msg.replace(FileUploadReg, '$1').trim()
  if (!Path) {
    await e.reply('请发送路径', { at: true })
    const event = await karin.ctx(e)
    Path = event.msg
  }

  if (!(fs.existsSync(Path))) {
    await e.reply('文件不存在', { reply: true })
    return true
  }

  await e.reply('开始上传文件', { reply: true })
  try {
    const name = path.basename(Path)
    await e.bot.uploadFile(e.contact, Path, name)
    await e.reply('上传完成', { reply: true })
  } catch (error) {
    logger.error(`文件上传错误：${error}`)
    await e.reply('文件下载错误：请前往控制台查询', { reply: true })
  }
  return true
}, { name: '文件上传', priority: -1, permission: 'master' })

export const getfile = karin.command(/^#(取|get)文件直链$/i, async (e) => {
  if (e.bot.adapter.protocol !== 'icqq') return e.reply('仅支持ICQQ协议', { at: true })
  if (!e.replyId) return e.reply('请回复需要获取直链的文件消息', { at: true })
  const msg = await e.bot.getMsg(e.contact, e.replyId)
  const file = JSON.parse((msg.elements.find(item => item.type === 'text'))!.text)
  if (file.type !== 'file') {
    return e.reply('未识别到文件', { at: true })
  }
  let url
  if (!e.isGroup) {
    url = await (e.bot as any).super.pickFriend(e.userId).getFileUrl(file.fid)
  } else {
    url = await (e.bot as any).super.pickGroup(e.groupId).getFileUrl(file.fid)
  }
  if (!url) {
    e.reply('获取链接失败', { at: true })
    return true
  }
  return await e.reply(`文件名: ${file.name}\n文件大小: ${await Size(file.size)}\n文件链接: ${url}`, { at: true })
})
