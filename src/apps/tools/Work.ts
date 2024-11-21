import { logger } from 'node-karin'
import { Config } from '@/components'

const Work = async (e: { isGroup: any; msg: string | string[]; group_id: any }) => {
  if (!e.isGroup) {
    logger.debug('不在群聊，跳过拦截')
    return false
  }
  if (e.msg.includes('上班') || e.msg.includes('下班')) {
    return false
  }
   let data = (Config.getYaml('config', 'other')).NoWork
  if (data.includes(e.group_id)) {
    return true
  }
  return false
}

export default {
  Work,
}
