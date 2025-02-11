import { exec, karin, logger, restart } from 'node-karin'
import { dirPath } from '@/utils/dir'

let isupdate = false

export const update = karin.command(/^#?(铃|ling)(插件)?更新$/i, async (e) => {
  if (isupdate) return e.reply('正在更新中,请稍后再试')
  const isNPM = !!dirPath.includes('node_modules')
  if (!isNPM) return e.reply('未检测到NPM插件')

  isupdate = true

  if (isNPM) {
    await e.reply('开始更新插件')
    const { error, stdout } = await exec('pnpm up karin-plugin-ling')
    if (stdout.includes('Already up to date')) {
      isupdate = false
      return e.reply('插件已是最新版本')
    }
    if (error) {
      isupdate = false
      await e.reply(error.message)
      return logger.error(error)
    }
  }
  isupdate = false
  await e.reply('更新完成,开始重启')
  return await restart(e.selfId, e.contact, e.messageId)
}, { name: '插件更新', perm: 'master', priority: -1 })
