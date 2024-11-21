import { karin, segment } from 'node-karin';
import { Config } from '../components/index.js';
export const 续火 = karin.task("续火", Config.Cof.corn || "0 0 * * *", async (e) => {
    for (const id of Config.Cof.List || '') {
        try {
            let msgs = Config.Cof.msg;
            let Random = Math.floor(Math.random() * msgs.length);
            const msg = msgs[Random];
            const elements = [segment.text(msg)];
            const contact = karin.contactFriend(id);
            await e.bot.SendMessage(contact, elements);
        }
        catch (error) { }
    }
}, { name: "续火" });
