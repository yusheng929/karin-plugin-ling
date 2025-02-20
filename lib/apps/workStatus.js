import { addYaml, delYaml, other } from '../utils/config.js';
import { karin } from 'node-karin';
export const test = karin.command(/^#(上班|下班)$/, async (e) => {
    const cfg = other();
    if (e.msg.includes('上班')) {
        if (!cfg.noWork.includes(e.groupId)) {
            await e.reply('我已经在认真工作了哦！(๑•̀ㅂ•́)و✧');
            return true;
        }
        delYaml('other', 'noWork', e.groupId);
        await e.reply('打起精神开始上班啦！为大家服务！ヾ(◍°∇°◍)ﾉﾞ');
        return true;
    }
    if (cfg.noWork.includes(e.groupId)) {
        await e.reply('我已经在休息了啦，别打扰我~(。-ω-)zzz');
        return true;
    }
    addYaml('other', 'noWork', e.groupId);
    await e.reply('终于可以休息啦！跟大家说晚安！(｡･ω･｡)ﾉ♡');
    return true;
}, { permission: 'master', event: 'message.group' });
