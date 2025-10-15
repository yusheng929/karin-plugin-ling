import karin from 'node-karin'
import fs from 'node:fs'
import { helpList } from '@/models/help/index'
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
  const changelogMarkdown = fs.readFileSync(dirPath + '/CHANGELOG.md', 'utf8')
  const versions = parseChangelogForLatest(changelogMarkdown, 5)
  const img = await render('version/index', { versions })
  await e.reply(img, { reply: true })
  return true
})

type ChangelogSection = {
  title: string
  items: string[]
}

type ChangelogEntry = {
  version: string
  date?: string
  sections: ChangelogSection[]
}

function parseChangelogForLatest (markdown: string, limit: number): ChangelogEntry[] {
  const lines = markdown.split(/\r?\n/)
  const entries: ChangelogEntry[] = []

  let current: ChangelogEntry | null = null
  let currentSection: ChangelogSection | null = null

  const versionHeaderRegex = /^##\s+\[(?<version>[^\]]+)\][^()]*\((?<date>[^)]+)\)/
  const versionHeaderAltRegex = /^##\s+(?<version>\S+)/
  const sectionHeaderRegex = /^###\s+(?<title>.+)$/
  const listItemRegex = /^\*\s+(?<text>.+)$/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // New version entry
    if (line.startsWith('## ')) {
      if (current) {
        entries.push(current)
        if (entries.length >= limit) break
      }
      const m = line.match(versionHeaderRegex) || line.match(versionHeaderAltRegex)
      const version = (m && (m.groups?.version || '').trim()) || ''
      const date = (m && (m.groups?.date || '').trim()) || undefined
      current = { version, date, sections: [] }
      currentSection = null
      continue
    }

    if (!current) continue

    // Section header
    const sec = line.match(sectionHeaderRegex)
    if (sec) {
      currentSection = { title: (sec.groups?.title || '').trim(), items: [] }
      current.sections.push(currentSection)
      continue
    }

    // List item
    const li = line.match(listItemRegex)
    if (li && currentSection) {
      const raw = (li.groups?.text || '').trim()
      // 1) Collapse Markdown links like [hash](url) -> [hash]
      // 2) Remove wrapping parentheses around bracketed tokens: ([hash]) -> [hash]
      // 3) Trim any remaining trailing parentheses blocks
      let text = raw
        .replace(/\[([^\]]+)\]\((?:https?:\/\/|\/)[^)]*\)/gi, '[$1]')
        .replace(/\((\[[^\]]+\])\)/g, '$1')
        .replace(/\s*\([^)]*\)\s*$/, '')

      text = text.trim()
      if (text) currentSection.items.push(text)
    }
  }

  // Push the last collected entry if under the limit
  if (current && entries.length < limit) entries.push(current)

  return entries.slice(0, limit)
}
