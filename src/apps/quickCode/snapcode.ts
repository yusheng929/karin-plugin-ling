import fs from 'node:fs'
import path from 'node:path'
import { karin, logger } from 'node-karin'
import hljs from 'highlight.js'
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'
import powershell from 'highlight.js/lib/languages/powershell'
import { render } from '@/utils/render'

// 注册常用语言高亮
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('powershell', powershell)

const extToLanguage: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  html: 'html',
  htm: 'html',
  css: 'css',
  sh: 'bash',
  bash: 'bash',
  ps1: 'powershell',
  xml: 'xml',
  md: 'markdown',
}

function detectLanguageByExt (filePath: string): string | undefined {
  const ext = path.extname(filePath).replace('.', '').toLowerCase()
  return extToLanguage[ext]
}

function buildCodeHtmlWithLineNumbers (highlightedHtml: string, startLine: number): string {
  const lines = highlightedHtml.split('\n')
  return lines.map((line, idx) => {
    const ln = startLine + idx
    const content = line === '' ? '&nbsp;' : line
    return `<div class="code-line"><span class="line-number">${ln}</span><span class="line-content">${content}</span></div>`
  }).join('')
}

function resolveTargetPath (raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (path.isAbsolute(trimmed) && fs.existsSync(trimmed)) return trimmed
  const fromCwd = path.resolve(process.cwd(), trimmed)
  if (fs.existsSync(fromCwd)) return fromCwd
  const fromSrc = path.resolve(process.cwd(), 'src', trimmed)
  if (fs.existsSync(fromSrc)) return fromSrc
  return null
}

export const snapcode = karin.command(/^sc\s+(.+?)(?:\s+(\d+)(?:~(\d+))?)?$/i, async (e) => {
  const match = e.msg.match(/^sc\s+(.+?)(?:\s+(\d+)(?:~(\d+))?)?$/i)
  if (!match) return false
  const [, rawPath, startStr, endStr] = match

  const fullPath = resolveTargetPath(rawPath)
  if (!fullPath) {
    await e.reply('未找到文件，请检查路径是否正确', { reply: true })
    return true
  }

  let codeText: string
  try {
    codeText = fs.readFileSync(fullPath, 'utf-8')
  } catch (err) {
    logger.error(`读取文件失败: ${fullPath}`, err)
    await e.reply('读取文件失败', { reply: true })
    return true
  }

  const allLines = codeText.split(/\r?\n/)
  const totalLines = allLines.length

  let startLine = startStr ? parseInt(startStr, 10) : 1
  let endLine = endStr ? parseInt(endStr, 10) : (startStr ? parseInt(startStr, 10) : totalLines)
  if (Number.isNaN(startLine) || Number.isNaN(endLine)) {
    await e.reply('行号格式不正确，应为 1 或 1~2', { reply: true })
    return true
  }
  if (startLine < 1) startLine = 1
  if (endLine < 1) endLine = 1
  if (startLine > totalLines) startLine = totalLines
  if (endLine > totalLines) endLine = totalLines
  if (startLine > endLine) [startLine, endLine] = [endLine, startLine]

  const slice = allLines.slice(startLine - 1, endLine).join('\n')

  // 语法高亮
  const language = detectLanguageByExt(fullPath)
  let highlighted = ''
  try {
    if (language && hljs.getLanguage(language)) {
      highlighted = hljs.highlight(slice, { language }).value
    } else {
      const auto = hljs.highlightAuto(slice)
      highlighted = auto.value
    }
  } catch {
    highlighted = hljs.highlightAuto(slice).value
  }

  const codeHtml = buildCodeHtmlWithLineNumbers(highlighted, startLine)
  const fileName = path.basename(fullPath)
  const relFromCwd = path.relative(process.cwd(), fullPath)
  const rangeText = `${startLine} ~ ${endLine}`

  const img = await render('snapcode/index', {
    data: {
      fileName,
      filePath: relFromCwd || fullPath,
      totalLines,
      rangeText,
      codeHtml,
    },
  })

  await e.reply(img, { reply: true })
  return true
}, { name: '查看文件代码', permission: 'master', priority: -1 })
