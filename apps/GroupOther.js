import { karin, logger, segment } from 'node-karin'

/**
 * 看头像
 */
export const SeeImg = karin.command(/^#看(群)?头像/, async (e) => {
let userId = ''
 if (e.at.length) {
    userId = e.at[0]
  } else {
    userId = e.msg.replace(/#看(群)?头像/, '').trim()
  }

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }
  let Img = e.bot.getAvatarUrl(userId, 640);
  e.reply(segment.image(Img))
  return true
}, { name: "看头像", priority: "-1" })

/**
 * 看群头像
 */
export const SeeGroupImg = karin.command(/^#(看|取)群头像/, async (e) => {
let groupId = e.msg.replace(/^#?(看|取)群头像/, "").trim() || e.group_id
  let Img = e.bot.getGroupAvatar(groupId, 640);
  e.reply(segment.image(Img))
  return true
}, { name: "看群头像", priority: "-1" })