import karin from 'node-karin'
import fs from 'node:fs'
import { helpList } from '@/models/help/index'
import { markdown } from '@karinjs/md-html'
import { render } from '@/components/puppeteer'
import { dirPath } from '@/utils/dir'

export const help = karin.command(/^#?(铃|ling)(帮助|菜单|help)$/i, async (e) => {
  const img = await render('help/index', {
    helpList
  })
  await e.reply(img)
  return true
}, { name: '帮助', priority: -1 })

export const version = karin.command(/^#?(铃|ling)(版本|version)$/i, async (e) => {
  const changelogs = fs.readFileSync(dirPath + '/CHANGELOG.md', 'utf8')
  const html = markdown(changelogs, {})
  fs.writeFileSync(dirPath + '/resources/help/changelogs.html', html)
  const img = await render('help/changelogs', {
    copyright: 'karin-plugin-ling',
  })
  await e.reply(img)
  return true
})
