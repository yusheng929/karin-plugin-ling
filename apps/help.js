import { karin, segment, common } from 'node-karin'

export const help = karin.command(/^#?群管帮助/, async (e) => {
 e.reply(segment.image(`file://karin-plugin-group/resources/help/help.jpg`))
    return true
  })