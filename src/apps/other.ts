import path from 'node:path'
import { finished } from 'stream/promises'
import fs from 'fs'
import { karin, segment, common, logger, ImageElement, system, VideoElement } from 'node-karin'
import { karinPathBase } from 'node-karin/root'
import { refreshRkey, sleep } from '@/utils/common'
import axios from 'node-karin/axios'
import { pluginName } from '@/utils/dir'

/**
 * 看群头像
**/
export const SeeImg = karin.command(/^#(看|取)头像/, async (e) => {
  const userId = e.at.length ? e.at[0] : e.msg.replace(/#(看|取)头像/, '').trim()
  if (!userId) {
    await e.reply('请指定用户', { at: true })
    return true
  }

  const url = await e.bot.getAvatarUrl(userId, 640 as any)
  if (e.msg.includes('取')) return e.reply(url)
  await e.reply(segment.image(url))
  return true
}, { name: '看头像', priority: -1 })

/**
 * 看群头像
 */
export const SeeGroupImg = karin.command(/^#(看|取)群头像/, async (e) => {
  const groupId = e.msg.replace(/^#(看|取)群头像/, '').trim() || e.groupId
  if (!groupId) {
    e.reply('请输入正确的群号')
    return true
  }
  const url = await e.bot.getGroupAvatarUrl(groupId, 640 as any)
  if (e.msg.includes('取')) return e.reply(url)
  await e.reply(segment.image(url))
  return true
}, { name: '看群头像', priority: -1, event: 'message.group' })

export const sendAllGroup = karin.command(/^#群发/, async (e) => {
  const msg = e.msg.replace(/^#群发/, '').trim()
  const groupList = await e.bot.getGroupList()
  const count = {
    all: 0,
    success: 0,
    fail: 0,
  }
  if (!groupList.length) return e.reply('群列表为空或者获取失败')
  count.all = groupList.length
  for (const group of groupList) {
    try {
      const contact = karin.contactGroup(group.groupId)
      await e.bot.sendMsg(contact, [segment.text(msg)])
      count.success++
      logger.debug(`发送群聊消息[${group.groupId}]成功`)
      await sleep(1000)
    } catch (e) {
      count.fail++
      logger.error(`发送群聊消息[${group.groupId}]失败\n`, e)
    }
  }
  return await e.reply(`群发完成\n总数: ${count.all}\n成功: ${count.success}\n失败: ${count.fail}`, { at: true })
}, { name: '群发', priority: -1, permission: 'master' })

export const getimg = karin.command(/#?取直链/, async (e) => {
  const msg1: (ImageElement | VideoElement)[] = []
  if (e.replyId) {
    const msg = (await e.bot.getMsg(e.contact, e.replyId)).elements
    msg1.push(...msg.filter(item => item.type === 'image'))
    msg1.push(...msg.filter(item => item.type === 'video'))
  }
  const msg2 = [...e.elements.filter(item => item.type === 'image'), ...e.elements.filter(item => item.type === 'video')]
  const msg3 = [...msg1, ...msg2]
  const msg = []
  for (const i of msg3) {
    if (i.type === 'video') {
      msg.push([segment.video(i.file), segment.text(`视频链接: ${i.file}`)])
      continue
    }
    i.file = await refreshRkey(e, i) || ''
    msg.push([segment.image(i.file), segment.text(`图片链接: ${i.file}`)])
  }
  const content = common.makeForward(msg, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { event: 'message.group' })

export const getVideoToAudio = karin.command(/^#取音频/, async (e) => {
  let url = e.elements.find(i => i.type === 'video')?.file
  if (!url && e.replyId) url = (await e.bot.getMsg(e.contact, e.replyId)).elements.find(i => i.type === 'video')?.file
  if (!url) return e.reply('没有找到视频')
  try {
    const temp = path.join(karinPathBase, pluginName, 'temp')
    const VideoPath = path.join(temp, `video_${Date.now()}.mp4`)
    const res = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    })
    const writer = fs.createWriteStream(VideoPath)
    res.data.pipe(writer)
    await finished(writer)
    const AudioName = `audio_${Date.now()}.mp3`
    const AudioPath = path.join(temp, AudioName)
    await system.ffmpeg(`-i ${VideoPath} -vn -acodec libmp3lame -q:a 2 ${AudioPath}`)
    await e.reply(segment.record(AudioPath))
    await e.bot.uploadFile(e.contact, AudioPath, AudioName)
    fs.unlinkSync(VideoPath)
    setTimeout(() => {
      fs.unlink(AudioPath, (err) => {
        if (err) logger.error('删除音频文件失败', err)
      })
    }, 1000 * 60 * 10)
    logger.info(`音频文件位于${AudioPath}`)
    logger.info('音频文件将在10分钟后删除')
    return true
  } catch (error) {
    logger.error('获取视频音频失败', error)
    return e.reply('获取视频音频失败，请稍后再试')
  }
})
