import { karin, segment } from 'node-karin'
import QR from 'qrcode'

export const 生成二维码 = karin.command(/^#生成二维码/, async (e) => {

const msg = e.msg.replace(/生成二维码/, "").trim()
    const img = (await QR.toDataURL(msg)).replace("data:image/png;base64,", "base64://")
    return await e.reply(segment.image(img), true)

}, { name: '生成二维码', priority: '-1', permission: 'master' })