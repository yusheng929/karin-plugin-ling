import { Data, Render, Version } from '#components'
import lodash from 'lodash'
import { helpCfg, helpList, helpTheme } from '#models'

const app = {
  id: 'help',
  name: '帮助'
}

const rule = {
  help: {
    reg: /^#?群管(帮助|菜单|help)$/i,
    fnc: help
  },
  version: {
    reg: /^#?群管(版本|version)$/i,
    fnc: version
  }
}

export const helpApp = new Data(app, rule).create()

async function help (e) {
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
    scale: 1.2
  })
  return await e.reply(img)
}

async function version (e) {
  const img = await Render.render('help/version-info', {
    currentVersion: Version.version,
    changelogs: Version.changelogs,
    scale: 1.2
  })
  return await e.reply(img)
}
