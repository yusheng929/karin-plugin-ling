import { render } from '@/components/puppeteer'
import { RunJs } from '@/components/runcode'
import os from 'os'
import * as karin from 'node-karin'
import hljs from 'highlight.js'
import shell from 'highlight.js/lib/languages/powershell'
hljs.registerLanguage('powershell', shell)

// Escape HTML special characters
const escapeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Convert a subset of ANSI SGR sequences to HTML spans with inline styles
const ansiToHtml = (input: string): string => {
  // First escape raw HTML so only our generated tags render
  const escaped = escapeHtml(input)

  type StyleState = {
    color?: string
    backgroundColor?: string
    bold?: boolean
    underline?: boolean
    inverse?: boolean
  }

  const colorMap: Record<number, string> = {
    30: '#000000', // black
    31: '#e06c75', // red
    32: '#98c379', // green
    33: '#e5c07b', // yellow
    34: '#61afef', // blue
    35: '#c678dd', // magenta
    36: '#56b6c2', // cyan
    37: '#dcdfe4', // white (light gray)
    90: '#7f848e', // bright black (gray)
    91: '#ff7b86', // bright red
    92: '#b4e08b', // bright green
    93: '#ffd47e', // bright yellow
    94: '#8ab4f8', // bright blue
    95: '#dda6f3', // bright magenta
    96: '#8be9fd', // bright cyan
    97: '#ffffff', // bright white
  }

  const bgMap: Record<number, string> = {
    40: colorMap[30],
    41: colorMap[31],
    42: colorMap[32],
    43: colorMap[33],
    44: colorMap[34],
    45: colorMap[35],
    46: colorMap[36],
    47: colorMap[37],
    100: colorMap[90],
    101: colorMap[91],
    102: colorMap[92],
    103: colorMap[93],
    104: colorMap[94],
    105: colorMap[95],
    106: colorMap[96],
    107: colorMap[97],
  }

  // eslint-disable-next-line no-control-regex
  const sgrRegex = /(\x1b\[[0-9;]*m)/g
  const parts = escaped.split(sgrRegex)

  const state: StyleState = {}
  let openSpan = ''

  const styleString = (s: StyleState): string => {
    // Apply inverse by swapping colors
    const fg = s.inverse ? s.backgroundColor : s.color
    const bg = s.inverse ? s.color : s.backgroundColor
    const styles: string[] = []
    if (fg) styles.push(`color: ${fg}`)
    if (bg) styles.push(`background-color: ${bg}`)
    if (s.bold) styles.push('font-weight: 700')
    if (s.underline) styles.push('text-decoration: underline')
    return styles.join('; ')
  }

  const openIfNeeded = (): string => {
    const st = styleString(state)
    if (!st) return ''
    openSpan = st
    return `<span style="${st}">`
  }

  const closeIfNeeded = (): string => {
    if (!openSpan) return ''
    openSpan = ''
    return '</span>'
  }

  const applyCodes = (codes: number[]): void => {
    // Reset first if 0 present
    if (codes.includes(0) || codes.length === 0) {
      state.color = undefined
      state.backgroundColor = undefined
      state.bold = undefined
      state.underline = undefined
      state.inverse = undefined
    }
    for (const c of codes) {
      if (c === 0) continue
      if (c === 1) state.bold = true
      if (c === 4) state.underline = true
      if (c === 7) state.inverse = true
      if (c >= 30 && c <= 37) state.color = colorMap[c]
      if (c >= 90 && c <= 97) state.color = colorMap[c]
      if (c >= 40 && c <= 47) state.backgroundColor = bgMap[c]
      if (c >= 100 && c <= 107) state.backgroundColor = bgMap[c]
      // Basic handling: clear styles
      if (c === 22) state.bold = undefined
      if (c === 24) state.underline = undefined
      if (c === 27) state.inverse = undefined
    }
  }

  let result = ''
  for (const token of parts) {
    // eslint-disable-next-line no-control-regex
    const m = token.match(/^\x1b\[([0-9;]*?)m$/)
    if (m) {
      // It's an SGR sequence
      const codes = (m[1] ? m[1].split(';') : ['0']).map((n) => Number(n) || 0)
      // When styles change, close previous span and open new if needed
      result += closeIfNeeded()
      applyCodes(codes)
      result += openIfNeeded()
    } else if (token) {
      result += token
    }
  }
  result += closeIfNeeded()
  return result
}

export const runjs = karin.karin.command(/^rjs/, async (e) => {
  const code = e.msg.replace(/^rjs/, '').trim()
  if (!code) return false
  try {
    const sandbox = {
      im: async (module: string) => {
        // eslint-disable-next-line no-eval
        return await eval(`import('${module}')`)
      },
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

export const runcode = karin.karin.command(/^rc(p)?(.*)$/, async (e) => {
  const [, isPic, code] = e.msg.match(/^rc(p)?(.*)$/) || []
  if (!code) return false
  const isWindows = os.platform() === 'win32'
  const username = os.userInfo().username
  const hostname = os.hostname()
  const Path = process.cwd()
  let title
  if (isWindows) {
    title = `${username}@${hostname} ${Path}>`
  } else {
    title = `${username}@${hostname}:${Path.replace(/^\/root/, '~')}${username === 'root' ? '#' : '$'}`
  }
  const { error, stdout, stderr } = await karin.exec(code)
  let output = stderr + (error || stdout)
  if (isPic) {
    const highlightedCode = hljs.highlight(code, { language: 'powershell' }).value
    const htmlOutput = `${escapeHtml(title)} ${highlightedCode}\n${ansiToHtml(output)}`
    const img = await render('runcode/index', { data: { output: htmlOutput } })
    e.reply(img)
  } else {
    output = title + code + '\n' + output
    e.reply(output, { reply: true })
  }
  return true
}, { name: 'RunCode', permission: 'master', priority: -1 })
