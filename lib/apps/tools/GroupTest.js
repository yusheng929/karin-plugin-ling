import { karin } from 'node-karin';
import { Config } from '../../components/index.js';
const GroupTest = async (e, group_id, user_id) => {
    let data = Config.Other.Test;
    if (!data.includes(group_id))
        return false;
    let num = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    await e.reply(`\n为确保你不是机器人\n请在3分钟内输入下方验证码\n『${num}』`, { at: true });
    try {
        for (let i = 3; i >= 0; i--) {
            const event = await karin.ctx(e, { time: 120, reply: false });
            if (i == 1 && !(event.msg == num.toString())) {
                await e.reply('验证失败，你将会被踢出群聊', { at: true });
                await e.bot.KickMember(group_id, user_id);
                return true;
            }
            if (event.msg == num.toString()) {
                await e.reply('\n验证通过，欢迎加入群聊', { at: true });
                return true;
            }
            else {
                await e.reply(`验证码错误，请重新输入\n你还有${i - 1}次机会`);
            }
        }
    }
    catch (error) {
        await e.reply('输入超时，你将会被踢出群聊', { at: true });
        await e.bot.KickMember(group_id, user_id);
        return true;
    }
};
export default {
    GroupTest,
};
