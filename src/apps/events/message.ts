import { Whoat } from '@/types/whoat'
import { other } from '@/utils/config'
import { hooks, logger, redis } from 'node-karin'
import moment from 'node-karin/moment'
import 'moment-timezone'

hooks.message.group(async (e, next) => {
  const cfg = other()
  if (e.at.length > 0 && cfg.whoat) {
    for (const id of e.at) {
      try {
        const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as Whoat
        data.push({
          time: moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
          nickname: e.sender.nick,
          msg: e.msg,
          userId: e.userId,
          img: e.elements.find((item) => item.type === 'image')?.file,
        })
        await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data))
      } catch (error) {
        logger.error(`设置Redis失败: ${error}`)
      }
    }
  }
  if (cfg.noWork.includes(e.groupId) && (!e.msg.includes('上班') && !e.msg.includes('下班'))) { return logger.debug(`群[${e.groupId}]处于下班状态,拦截消息`) }
  next()
}, { priority: -Infinity })
