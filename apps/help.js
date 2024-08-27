import karin from 'node-karin'
import lodash from 'lodash'
import fs from 'fs'
import { Render, Version } from '#components'
import { helpCfg, helpList, helpTheme } from '#models'
import { markdown } from '@karinjs/md-html'

export const help = karin.command(/^#?(铃|ling)(帮助|菜单|help)$/i, async (e) => {
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

export const version = karin.command(/^#?(铃|ling)(版本|version)$/i, async (e) => {
  const changelogs = fs.readFileSync(Version.pluginPath + '/CHANGELOG.md', 'utf8')
  const html = markdown(changelogs, {
    gitcss: 'github-markdown-dark.css',
  })
  fs.writeFileSync(Version.pluginPath + '/resources/help/changelogs.html', html)
  const img = await Render.render('help/changelogs', {
    scale: 1.2,
  })
  await e.reply(img)
  return true
})
