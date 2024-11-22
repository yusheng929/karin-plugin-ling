import Ling from "../../Ling.js";
import karin, { common, logger, segment } from "node-karin";
export const codejs = karin.command(/^rjs/, async (e) => {
    const code = e.msg.replace(/^rjs/, "").trim();
    if (!code)
        return false;
    try {
        const msg = eval(code);
        e.reply(msg);
    }
    catch (error) {
        e.reply(`错误：\n${error}`);
        logger.error(error);
    }
    return true;
}, { name: "CodeJs", permission: 'master', priority: -1 });
export const forwardMsg = karin.command(/^fm/, async (e) => {
    const msgs = e.msg.replace(/^fm/, "").trim();
    if (!msgs)
        return false;
    try {
        const elements = segment.text(msgs);
        const msg = common.makeForward(elements, e.self_id, e.bot.account.name);
        await e.bot.sendForwardMessage(e.contact, msg);
    }
    catch (error) {
        e.reply(`错误：\n${error}`);
        logger.error(error);
    }
    return true;
}, { name: "ForwardMsg", permission: 'master', priority: -1 });
export const code = karin.command(/^rc/, async (e) => {
    const code = e.msg.replace(/^rc/, "").trim();
    if (!code)
        return false;
    try {
        const msg = await Ling.exec(code);
        e.reply(msg);
        logger.info(msg);
    }
    catch (error) {
        e.reply(`${error}`);
        logger.error(error);
    }
    return true;
}, { name: "Code", permission: 'master', priority: -1 });
