import { karin, logger, segment } from 'node-karin'

/**
 * 看头像
 */
export const SeeImg = karin.command(/^#看头像/, async (e) => {
let userId = ''
 if (e.at.length) {
    userId = e.at[0]
  } else {
    userId = e.msg.replace(/#看头像/, '').trim()
  }

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }
  let Img = e.bot.getAvatarUrl(userId, 640);
  e.reply(segment.image(Img))
}, { name: "看头像", priority: "-1" })