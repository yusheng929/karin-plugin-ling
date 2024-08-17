import karin from 'node-karin'
import lodash from 'lodash'
import { Render, Version } from '#components'
import { helpCfg, helpList, helpTheme } from '#models'

export const help = karin.command(/^#?群管(帮助|菜单|help)$/i, async (e) => {
  const helpGroup = []

  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
      const icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        const x = (icon - 1) % 10
        const y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  const themeData = await helpTheme.getThemeData(helpCfg)
  const img = await Render.render('help/index', {
    helpCfg,
    helpGroup,
    ...themeData,
    scale: 1.2,
  })
  return await e.reply(img)
}, { name: '帮助', priority: '-1' })

export const version = karin.command(/^#?群管(版本|version)$/i, async (e) => {
  const img = await Render.render('help/version-info', {
    currentVersion: Version.version,
    changelogs: Version.changelogs,
    scale: 1.2,
  })
  return await e.reply(img)
})
