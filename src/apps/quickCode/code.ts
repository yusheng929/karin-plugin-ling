import { render } from '@/utils/render'
import { runShell } from '@/utils/exec'
import { RunJs } from '@/models/runcode'
import os from 'os'
import * as karin from 'node-karin'
import hljs from 'highlight.js'
import shell from 'highlight.js/lib/languages/powershell'
hljs.registerLanguage('powershell', shell)

const createTitle = (user: string, host: string, path: string) => {
  const isWindows = os.platform() === 'win32'
  const Path = isWindows ? path + '>' : path.replace(/^\/root/, '~')
  const symbol = user === 'root' ? '#' : '$'
  return `${user}@${host}:${Path}${symbol} `
}

/** 去除 ANSI 转义序列（如 [91m [0m） */
// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '')

/** HTML 转义，防止输出内容注入标签 */
const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** ANSI SGR 前景色码到 CSS 颜色的映射（适配浅色背景） */
const ANSI_FG: Record<number, string> = {
  30: '#1f2430',
  31: '#dc2626',
  32: '#16a34a',
  33: '#d97706',
  34: '#2563eb',
  35: '#7c3aed',
  36: '#0891b2',
  37: '#6b7280',
  90: '#4b5563',
  91: '#ef4444',
  92: '#22c55e',
  93: '#f59e0b',
  94: '#3b82f6',
  95: '#a855f7',
  96: '#06b6d4',
  97: '#374151'
}

/** ANSI SGR 背景色码到 CSS 颜色的映射（浅色徽标风格） */
const ANSI_BG: Record<number, string> = {
  40: '#e5e7eb',
  41: '#fecaca',
  42: '#bbf7d0',
  43: '#fde68a',
  44: '#bfdbfe',
  45: '#ddd6fe',
  46: '#a5f3fc',
  47: '#f3f4f6',
  100: '#e5e7eb',
  101: '#fecaca',
  102: '#bbf7d0',
  103: '#fde68a',
  104: '#bfdbfe',
  105: '#ddd6fe',
  106: '#a5f3fc',
  107: '#f3f4f6'
}

/** 将 ANSI 颜色序列还原为 HTML span，其余控制序列（光标移动、清屏等）剔除 */
const ansiToHtml = (str: string): string => {
  // eslint-disable-next-line no-control-regex
  const parts = str.split(/(\x1b\[[0-9;]*m)/)
  let html = ''
  let open = false
  let current = ''
  let fg: string | undefined
  let bg: string | undefined
  let bold = false
  for (let part of parts) {
    // eslint-disable-next-line no-control-regex
    const match = part.match(/^\x1b\[([0-9;]*)m$/)
    if (match) {
      const codes = match[1] === '' ? [0] : match[1].split(';').map(Number)
      for (const c of codes) {
        if (c === 0) {
          fg = undefined
          bg = undefined
          bold = false
        } else if (c === 1) {
          bold = true
        } else if (c === 22) {
          bold = false
        } else if (c === 39) {
          fg = undefined
        } else if (c === 49) {
          bg = undefined
        } else if (ANSI_FG[c]) {
          fg = ANSI_FG[c]
        } else if (ANSI_BG[c]) {
          bg = ANSI_BG[c]
        }
      }
      continue
    }
    /** 剔除非颜色的控制序列（CSI 非 SGR、OSC 等） */
    // eslint-disable-next-line no-control-regex
    part = part.replace(/\x1b(\[[0-9;?]*[A-Za-z]|\][^\x07]*(\x07|\x1b\\)?)/g, '')
    const text = escapeHtml(part)
    if (!text) continue
    /** 样式变化时才切换 span，避免产生空 span */
    const style = [fg && `color:${fg}`, bg && `background-color:${bg}`, bold && 'font-weight:700'].filter(Boolean).join(';')
    if (style !== current) {
      if (open) html += '</span>'
      if (style) html += `<span style="${style}">`
      open = !!style
      current = style
    }
    html += text
  }
  if (open) html += '</span>'
  return html
}

/** 输出着色：优先还原命令自身的 ANSI 颜色，无颜色时按关键词兜底 */
const formatLine = (line: string): string => {
  const html = ansiToHtml(line)
  if (html.includes('<span')) return html
  const text = html.replace(/https?:\/\/[^\s]+/g, '<span class="hl-url">$&</span>')
  /** 优先按行首级别标记判断（如 WARN / ERR 前缀），再按行内关键词兜底 */
  if (/^\s*(warn|wrn)/i.test(line)) return `<span class="hl-warn">${text}</span>`
  if (/^\s*(err|error|fail|fatal)/i.test(line)) return `<span class="hl-err">${text}</span>`
  if (/(?:error|err_|failed|exception|cannot|错误|失败)/i.test(line)) return `<span class="hl-err">${text}</span>`
  if (/(?:warn|警告)/i.test(line)) return `<span class="hl-warn">${text}</span>`
  if (/(?:success|done\b|ok\b|成功|完成)/i.test(line)) return `<span class="hl-ok">${text}</span>`
  return text
}

export const runjs = karin.karin.command(/^rjs/, async (e) => {
  const code = e.msg.replace(/^rjs/, '').trim()
  if (!code) return false
  try {
    const sandbox = {
      ...karin,
      ...global,
      ...globalThis,
      e,
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      global,
      globalThis,
      process,
    }
    const result = await RunJs(code, sandbox)
    if (result === '') return e.reply('没有返回值')
    const msg = typeof result === 'object' && result !== null ? JSON.stringify(result, null, 2) : String(result)
    return e.reply(msg, { reply: true })
  } catch (error) {
    if (String(error).includes('Script execution timed out')) return await e.reply('运行超时30秒,已终止运行', { reply: true })
    await e.reply(`错误：\n${error}`, { reply: true })
    karin.logger.error(error)
  }
  return true
}, { name: 'RunJs', permission: 'master', priority: -1 })

export const runcode = karin.karin.command(/^rc(p)?(.*)$/s, async (e) => {
  const [, isPic, code] = e.msg.match(/^rc(p)?(.*)$/s) || []
  if (!code) return false
  const username = os.userInfo().username
  const hostname = os.hostname()
  const Path = process.cwd()
  const { output } = await runShell(code)
  if (isPic) {
    const cmd = hljs.highlight(code, { language: 'powershell' }).value
    const isWindows = os.platform() === 'win32'
    const data = {
      user: username,
      host: hostname,
      path: isWindows ? Path + '>' : Path.replace(/^\/root/, '~'),
      symbol: username === 'root' ? '#' : '$',
      time: new Date().toTimeString().slice(0, 8),
      cmd,
      output: output.split('\n').filter(i => i.trim() !== '').map(formatLine)
    }
    const img = await render('runcode/index', { data })
    e.reply(img, { reply: true })
  } else {
    const text = createTitle(username, hostname, Path) + code + '\n' + stripAnsi(output)
    e.reply(text, { reply: true })
  }
  return true
}, { name: 'RunCode', permission: 'master', priority: -1 })
