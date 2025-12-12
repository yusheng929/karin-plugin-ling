import karin from 'node-karin'
import fs from 'node:fs'
import { render } from '@/utils/render'
import { dir } from '@/utils/dir'
const helpList = [
  {
    group: '群聊功能',
    list: [
      {
        title: '#全体(禁言|解禁)',
        desc: '开启或关闭全体禁言',
      },
      {
        title: '#(设置|取消)管理<@QQ>',
        desc: '设置或取消群管理员'
      },
      {
        title: '#踢<@QQ>',
        desc: '踢出群成员'
      },
      {
        title: '#解禁<@QQ>',
        desc: '解除成员禁言'
      },
      {
        title: '#禁言<时间><@QQ>',
        desc: '禁言被@的成员，默认单位秒，支持中文数字',
        perm: 'GroupAdmin',
      },
      {
        title: '#发(群)?公告',
        desc: '发送群公告'
      },
      {
        title: '#(申请|我要)头衔<内容>',
        desc: '申请自己的群头衔(留空取消头衔)'
      },
      {
        title: '#设置头衔<@QQ> <内容>',
        desc: '为成员设置/清空头衔'
      },
      {
        title: '#(查)?(幸运)?字符(列表)?',
        desc: '查看群幸运字符列表与点亮状态'
      },
      {
        title: '#抽(幸运)?字符',
        desc: '抽取群幸运字符'
      },
      {
        title: '#(开启|关闭)(幸运)?字符',
        desc: '开启或关闭群幸运字符功能'
      },
      {
        title: '#替换(幸运)?字符(字符ID)',
        desc: '将幸运字符替换为指定ID'
      },
      {
        title: '#(改|设置|修改)群名<内容>',
        desc: '修改群名称'
      },
      {
        title: '#(获取|查看)?禁言列表',
        desc: '查看本群禁言列表'
      },
      {
        title: '#(改|设置|修改)(bot)?群名片<@QQ> <内容>',
        desc: '修改指定成员或机器人群名片'
      },
      {
        title: '#?(加|设|移)精',
        desc: '对被回复的消息加精/设精/移除精华'
      },
      {
        title: '#(获取|查看)?精华列表(暂时未实现)',
        desc: '查看本群精华消息列表'
      },
      {
        title: '#(改|设置|修改)群头像',
        desc: '修改群头像'
      },
      {
        title: '#撤回',
        desc: '撤回被回复的消息'
      },
      {
        title: '#清屏',
        desc: '撤回指定条消息'
      },
      {
        title: '#(开启|关闭)加群通知',
        desc: '开启或关闭加群通知功能'
      },
      {
        title: '#(开启|关闭)进群验证',
        desc: '开启或关闭进群验证功能'
      }
    ]
  },
  {
    group: 'Bot相关功能',
    list: [
      {
        title: '#(取消)?(拉黑|拉白)(群)? <ID>',
        desc: '拉黑拉白群或用户',
        master: true
      },
      {
        title: '#退群<群号>',
        desc: '退出指定群聊',
        master: true
      },
      {
        title: '#设置头像<BotId>',
        desc: '修改bot头像Botid为空则修改当前Bot',
        master: true
      },
      {
        title: '#(我的|bot)违规记录',
        desc: '查看bot或用户的违规记录'
      }
    ]
  },
  {
    group: '其他功能',
    list: [
      {
        title: '#url(编码|解码)<内容>',
        desc: 'URL编码或解码'
      },
      {
        title: '#domain(编码|解码)<内容>',
        desc: '域名编码或解码'
      },
      {
        title: '#base64(编码|解码)<内容>',
        desc: 'Base64编码或解码'
      },
      {
        title: '#md5加密<内容>',
        desc: 'MD5加密'
      },
      {
        title: '#unicode(编码|解码)<内容>',
        desc: 'Unicode编码或解码'
      },
      {
        title: '#(看|取)头像<@QQ>',
        desc: '查看或获取用户头像或链接'
      },
      {
        title: '#(看|取)群头像<群号>',
        desc: '查看或获取群头像或链接'
      },
      {
        title: '#群发<内容>',
        desc: '向所有群发送消息',
        master: true
      },
      {
        title: '#取直链',
        desc: '获取图片或视频的直链'
      },
      {
        title: '#取音频',
        desc: '获取视频的音频文件'
      },
      {
        title: '#谁艾特我',
        desc: '查看谁艾特过我'
      },
      {
        title: '#清除艾特记录',
        desc: '清除自己的艾特记录'
      },
      {
        title: '#铃更新',
        desc: '更新铃插件(仅限NPM安装的用户)',
        master: true
      },
      {
        title: '#上班/下班',
        desc: '开启或关闭工作状态，下班状态功能将无法使用',
        master: true
      }
    ]
  }
]

export const help = karin.command(/^#?(铃|ling)(帮助|菜单|help)$/i, async (e) => {
  const img = await render('help/index', {
    helpList
  })
  await e.reply(img, { reply: true })
  return true
}, { name: '帮助', priority: -1 })

export const version = karin.command(/^#?(铃|ling)(版本|version)$/i, async (e) => {
  await e.reply(`当前版本:${dir.version}`, { reply: true })
  return true
})

export const changelog = karin.command(/^#?(铃|ling)(更新日志|changelog)$/i, async (e) => {
  const changelogMarkdown = fs.readFileSync(dir.version + '/CHANGELOG.md', 'utf8')
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
