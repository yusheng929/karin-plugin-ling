import qr from 'qrcode'
import { karin, segment } from 'node-karin'

export const generateQRCode = karin.command(/^#生成二维码/, async (e) => {
  const msg = e.msg.replace(/生成二维码/, '').trim()
  const img = (await qr.toDataURL(msg)).replace('data:image/png;base64,', 'base64://')
  await e.reply(segment.image(img), { reply: true })
  return true
}, { name: '生成二维码', priority: -1, permission: 'master' })
