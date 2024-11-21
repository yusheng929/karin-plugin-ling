import { Contact, karin, segment } from 'node-karin'
import { Config } from '@/components'

export const 续火 = karin.task("续火", (Config.getYaml('config', 'COF')).corn || "0 0 * * *", async (e: { bot: { SendMessage: (arg0: Contact<"group" | "friend" | "guild" | "guild_direct" | "nearby" | "stranger" | "stranger_from_group">, arg1: any[]) => any } }) => {
    for (const id of (Config.getYaml('config', 'COF')).List || '') {
   try {
   let msgs = (Config.getYaml('config', 'COF')).msg
   let Random = Math.floor(Math.random() * msgs.length)
   const msg = msgs[Random]
     const elements = [segment.text(msg)]
      const contact = karin.contactFriend(id)
      await e.bot.SendMessage(contact, elements)
   } catch (error) { }
  }
}, { name: "续火" })