import { other } from '@/utils/config'
import { hooks } from 'node-karin'

hooks.message.group(async (e, next) => {
  const cfg = other()
  if (!cfg.noWork.includes(e.groupId) || (e.msg.includes('上班') || e.msg.includes('下班'))) next()
}, { priority: -Infinity })
