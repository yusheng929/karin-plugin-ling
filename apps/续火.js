import { karin } from 'node-karin'
import { Config } from '#components'

export const 续火 = karin.task("续火", Config.Cof.corn || "0 0 * * *", async () => {
    for (const id of Config.Cof.List || '') {
   try {
     const elements = [segment.text(Config.Cof.msg)]
      const contact = karin.contactFriend(id)
      await e.bot.SendMessage(contact, elements)
   } catch (error) { }
  }
}, { name: "续火" })