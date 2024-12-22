import { karin, segment } from 'node-karin'
import { Config } from '@/components'

export const keepChat = karin.task("续火", Config.Cof.corn || "0 0 * * *", async (e: any) => {
    for (const id of Config.Cof.List || '') {
   try {
   let msgs = Config.Cof.msg
   let Random = Math.floor(Math.random() * msgs.length)
   const msg = msgs[Random]
     const elements = [segment.text(msg)]
      const contact = karin.contactFriend(id)
      await e.bot.SendMessage(contact, elements)
   } catch (error) { }
  }
})
