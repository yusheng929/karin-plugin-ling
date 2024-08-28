import moment from 'moment'
import { Version } from '#components'
import { Bot, redis } from 'node-karin'
import { getImgPalette } from './utils.js'

export default async function getBotState (e) {
  const botList = _getBotList(e)
  const dataPromises = botList.map(async (i) => {
    const bot = Bot.getBot(i)
    const uin = bot?.account?.uin || bot?.uin
    if (!uin) return false

    const { status = 11, version } = bot

    const nickname = bot.nickname || bot.account.name || '未知'

    // 头像
    const avatarUrl = bot.avatar ?? (Number(uin) ? `https://q1.qlogo.cn/g?b=qq&s=0&nk=${uin}` : 'default')
    const avatar = await getAvatarColor(avatarUrl)

    const platform = version?.version ?? '未知'

    const messageCount = await getMessageCount(bot)

    const countContacts = await getCountContacts(bot)

    let startTime = bot?.stat?.start_time || bot.adapter?.start_time || Math.floor(Date.now() / 1000)
    if (startTime > 999999999) {
      startTime = Math.floor(startTime / 1000)
    }
    const botRunTime = formatDuration(Math.floor(Date.now() / 1000) - startTime)
    const botVersion = `${version.name} v${version?.version || ''}`

    return {
      avatar,
      nickname,
      botRunTime,
      status,
      platform,
      botVersion,
      messageCount,
      countContacts
    }
  })

  return Promise.all(dataPromises).then(r => r.filter(Boolean))
}

async function getAvatarColor (url) {
  const defaultAvatar = `${Version.pluginPath}/resources/state/img/default_avatar.jpg`
  try {
    if (url == 'default') {
      url = defaultAvatar
    }
    const avatar = await getImgPalette(url)
    return avatar
  } catch {
    return {
      similarColor1: '#fff1eb',
      similarColor2: '#ace0f9',
      path: url
    }
  }
}
async function getMessageCount (bot) {
  const today = moment().format('YYYY-MM-DD')
  const keys = (() => {
        return [
          `karin:count:send:${today}`,
          `karin:count:recv:${today}`
        ]
  })()

  // const values = await redis.mGet(keys) || []
  const values = []
  for (const i of keys) {
    values.push(await redis.get(i))
  }

  const sent = values[0] || bot.stat?.sent_msg_cnt || 0
  const recv = values[1] || bot.stat?.recv_msg_cnt || 0
  const screenshot = values[2] || values[3] || 0

  return {
    sent: sent > 0 ? '发送: ' + sent : 0,
    recv: recv > 0 ? '接收: ' + recv : 0,
    screenshot
  }
}

async function getCountContacts (bot) {
  const friend = (await bot.GetFriendList?.())?.length || bot.fl?.size || 0
  const group = (await bot.GetGroupList?.())?.length || bot.gl?.size || 0
  const groupMember = Array.from(bot?.gml?.values() || []).reduce((acc, curr) => acc + curr.size, 0)
  return {
    friend: friend > 0 ? '好友: ' + friend : 0,
    group: group > 0 ? '群: ' + group : 0,
    groupMember
  }
}

function _getBotList (e) {
  /** bot列表 */
  let BotList = [e.self_id]

  // TODO: 多账号支持
  if (e.isPro) {
        BotList = Bot.getBotAll().map(i => i.account.uin)
  }
  return BotList
}

function formatDuration (seconds) {
  const duration = moment.duration(seconds, 'seconds')
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()
  const secs = duration.seconds()

  return `${days}天${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
