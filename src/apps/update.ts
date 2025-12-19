import { sendToFirstAdmin } from '@/utils/common'
import { checkPkgUpdate, db, karin, logger, restart, restartDirect, segment, updatePkg } from 'node-karin'
import { cfg } from '@/config'

let isupdate = false

export const update = karin.command(/^#(铃|ling)(插件)?更新$/i, async (e) => {
  if (isupdate) return e.reply('正在更新中,请稍后再试')
  isupdate = true
  await e.reply('开始更新插件')
  const res = await updatePkg('karin-plugin-ling')
  if (res.status === 'failed') {
    isupdate = false
    await e.reply(`更新失败: ${String(res.data)}`)
    return logger.error(res.data)
  }
  await e.reply(`更新完成(v${res.local} → v${res.remote})，即将重启以应用更新`)
  isupdate = false
  return await restart(e.selfId, e.contact, e.messageId)
}, { name: '插件更新', perm: 'master', priority: -1 })

interface LingUpdateStat {
  lastRemote: string
  lastLocal: string
}

const LING_UPDATE_DB_KEY = 'karin-plugin-ling:update:last'

export const TaskUpdate = karin.task('Ling-定时更新检查', '*/10 * * * *', async () => {
  if (process.env.NODE_ENV === 'development') return true

  const res = await checkPkgUpdate('karin-plugin-ling')
  if (res.status !== 'yes') return true

  const botIds = karin.getAllBotID()
  const selfId = botIds.find(id => id.toString() !== 'console')
  if (!selfId) return true

  const oc = await cfg.get('other')

  if (oc.autoUpdate) {
    const up = await updatePkg('karin-plugin-ling')
    if (up.status === 'failed') {
      await sendToFirstAdmin(selfId, [segment.text(`自动更新 karin-plugin-ling 失败: ${String(up.data)}`)])
      return true
    }

    await sendToFirstAdmin(selfId, [
      segment.text(
        `检测到插件 [karin-plugin-ling] 有新版本~\n已自动更新 (v${up.local} → v${up.remote})，即将重启以应用更新`
      ),
    ])
    await restartDirect()
    return true
  }

  const last = await db.get<LingUpdateStat>(LING_UPDATE_DB_KEY)
  if (last && last.lastRemote === res.remote) return true

  const msg = [
    segment.text(
      `检测到插件 [karin-plugin-ling] 有新版本~\n当前版本: v${res.local}\n最新版本: v${res.remote}\n请发送 #铃插件更新 进行更新。`
    ),
  ] as Parameters<typeof karin.sendMsg>[2]

  const messageId = await sendToFirstAdmin(selfId, msg)
  if (!messageId) return false

  await db.set<LingUpdateStat>(LING_UPDATE_DB_KEY, {
    lastRemote: res.remote,
    lastLocal: res.local
  })

  return true
}, { name: 'Ling-定时更新检查', log: false })
