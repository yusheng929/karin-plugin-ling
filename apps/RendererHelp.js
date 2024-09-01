import karin from 'node-karin'
import lodash from 'lodash'
import fs from 'fs'
import { Render, Version } from '#components'
import { helpCfg, helpList, helpTheme } from '#models'

export const RendererHelp = karin.command(/^#?(渲染器|puppeteer)管理(帮助|菜单|help)$/i, async (e) => {
  const HelpGroup = []

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

    HelpGroup.push(group)
  })
  const themeData = await helpTheme.getThemeData(helpCfg)
  const img = await Render.render('help/index', {
    helpCfg,
    HelpGroup,
    ...themeData,
    scale: 1.2,
  })
  return await e.reply(img)
}, { name: '帮助', priority: '-1' })