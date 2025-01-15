import karin from 'node-karin'
import punycode from 'punycode/'
import crypto from 'crypto'

export const url = karin.command(/^#?url(编码|解码)(.*)/i, async (e) => {
  let url = e.msg.replace(/^#?url(编码|解码)/i, '').trim()
  if (e.msg.includes('编码')) {
    url = encodeURIComponent(url)
  } else {
    url = decodeURIComponent(url)
  }
  await e.reply(url)
  return true
}, { name: 'url编码/解码', priority: -1 })

export const domain = karin.command(/^#?domain(编码|解码)(.*)/i, async (e) => {
  const domain = e.msg.replace(/^#?domain(编码|解码)/i, '').trim()

  await e.reply(e.msg.includes('编码') ? punycode.toASCII(domain) : punycode.toUnicode(domain))
  return true
}, { name: '域名编码/解码', priority: -1 })

export const base64 = karin.command(/^#?base64(编码|解码)(.*)/i, async (e) => {
  let base64 = e.msg.replace(/^#?base64(编码|解码)/i, '').trim()
  if (e.msg.includes('编码')) {
    base64 = Buffer.from(base64).toString('base64')
  } else {
    base64 = Buffer.from(base64, 'base64').toString()
  }
  await e.reply(base64)
  return true
}, { name: 'base64编码/解码', priority: -1 })

export const md5 = karin.command(/^#?md5加密(.*)/i, async (e) => {
  let md5 = e.msg.replace(/^#?md5加密/i, '').trim()
  md5 = crypto.createHash('md5').update(md5).digest('hex')
  await e.reply(md5)
  return true
}, { name: 'md5', priority: -1 })
export const unicode = karin.command(/^#?unicode(编码|解码)(.*)/i, async (e) => {
  let unicode = e.msg.replace(/^#?unicode(编码|解码)/i, '').trim()
  if (e.msg.includes('编码')) {
    unicode = unicode.split('').map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join('')
  } else {
    unicode = unicode.replace(/\\u[\dA-Fa-f]{4}/g, (match) => String.fromCharCode(parseInt(match.replace('\\u', ''), 16)))
  }
  await e.reply(unicode)
  return true
}, { name: 'unicode编码', priority: -1 })
