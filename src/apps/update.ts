import { exec, karin, logger, restart } from 'node-karin'
import { dirPath, pluginName } from '@/utils/dir'

const isupdate = false
const isNPM = !!dirPath.includes('node_modules')
let isPro = false

export const update = karin.command(/^#?(铃|ling)(插件)?(强制)?更新$/i, async (e) => {
  if (isupdate) {
    e.reply('正在更新中,请稍后再试')
  }

  if (e.msg.includes('强制')) isPro = true

  if (isNPM) {
    const { error } = await exec('npm up karin-plugin-ling')
    if (error) {
      await e.reply(error.message)
      return logger.error(error)
    }
  } else {
    if (isPro) {
      const { error } = await exec(`cd plugins/${pluginName} && git reset --hard && git pull`)
      if (error) {
        await e.reply(error.message)
        return logger.error(error)
      }
    } else {
      const { error } = await exec(`cd plugins/${pluginName} && git pull`)
      if (error) {
        await e.reply(error.message)
        return logger.error(error)
      }
    }
  }
  await e.reply('更新完成,开始重启')
  return await restart(e.selfId, e.contact, e.messageId)
}, { name: '插件更新', perm: 'master', priority: -1 })
