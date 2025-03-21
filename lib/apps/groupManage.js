import { karin, redis } from 'node-karin';
import { addYaml, delYaml, other } from '../utils/config.js';
const handle = async (e, key, yes, type) => {
    const flag = await redis.get(key);
    if (!flag) {
        await e.reply('找不到这个请求啦！！！请手动同意吧');
        return true;
    }
    if (type === 'groupinvite') {
        await e.bot.setInvitedJoinGroupResult(flag, yes);
        await e.reply(`已${yes ? '同意' : '拒绝'}加群申请`);
    }
    else {
        await e.bot.setFriendApplyResult(flag, yes);
        await e.reply(`已${yes ? '同意' : '拒绝'}好友申请`);
    }
    await redis.del(key);
    return true;
};
export const groupApplyReply = karin.command(/^#?(同意|拒绝)$/, async (e) => {
    const opts = other();
    if (!e.reply)
        return false;
    if (e.isGroup) {
        if (!opts.group.list.includes(e.groupId))
            return false;
        if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
            await e.reply('暂无权限，只有管理员才能操作');
            return true;
        }
        const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
        if (!(['owner', 'admin'].includes(info.role))) {
            await e.reply('少女做不到呜呜~(>_<)~');
            return true;
        }
        const key = `Ling:groupinvite:${e.replyId}`;
        const flag = await redis.get(key);
        if (!flag) {
            await e.reply('找不到这个请求啦！！！请手动同意吧');
            return true;
        }
        if (e.msg === '同意') {
            await e.bot.setInvitedJoinGroupResult(flag, true);
            await e.reply('已同意加群申请');
        }
        else {
            await e.bot.setInvitedJoinGroupResult(flag, false);
            await e.reply('已拒绝加群申请');
        }
        await redis.del(key);
        return true;
    }
    else {
        const messageId = e.replyId;
        const msgs = await e.bot.getMsg(e.contact, messageId);
        const textContent = msgs.elements.find(element => element.type === 'text')?.text;
        const msg = textContent ? textContent.split('\n') : [];
        const groupId = msg[1].match(/[1-9]\d*/g);
        const userId = msg[3].match(/[1-9]\d*/g);
        if (msg[0].includes('邀请加群')) {
            const key = `Ling:groupinvite:${groupId}:${userId}`;
            const yes = /同意/.test(e.msg);
            await handle(e, key, yes, 'groupinvite');
        }
        else {
            if (msg[0].includes('好友申请')) {
                const key = `Ling:friendapply:${userId}`;
                const yes = /同意/.test(e.msg);
                await handle(e, key, yes, 'friendapply');
            }
        }
        return true;
    }
}, { name: '加群申请处理', priority: -1, event: 'message.group' });
export const groupApplySwitch = karin.command(/^#(开启|关闭)加群通知$/, async (e) => {
    const opts = other().group;
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    if (e.msg.includes('关闭')) {
        if (!opts.list.includes(e.groupId)) {
            await e.reply('本群暂未开启加群申请通知');
            return true;
        }
        delYaml('other', 'group.list', e.groupId);
    }
    else {
        if (opts.list.includes(e.groupId)) {
            await e.reply('本群已开启加群申请通知');
            return true;
        }
        addYaml('other', 'group.list', e.groupId);
    }
    await e.reply(`已${e.msg.includes('关闭') ? '关闭' : '开启'}[${e.groupId}]的加群申请通知`);
    return true;
}, { name: '加群通知开关', priority: -1, event: 'message.group' });
export const Notification = karin.command(/^#(开启|关闭)进群通知/, async (e) => {
    let groupId = e.msg.replace(/#(开启|关闭)进群通知/, '').trim();
    if (e.isGroup)
        groupId = groupId || e.groupId;
    if (!groupId) {
        await e.reply('\n请输入正确的群号', { at: true });
        return false;
    }
    const cfg = other();
    if (e.msg.includes('关闭')) {
        if (!cfg.accept.disable_list.includes(groupId)) {
            await e.reply(`\n群『${groupId}』的进群通知已经处于关闭状态`, { at: true });
            return true;
        }
        addYaml('other', 'accept.disable_list', groupId);
        await e.reply(`\n已经关闭群『${groupId}』的进群通知`, { at: true });
        return true;
    }
    if (cfg.accept.enable_list.includes(groupId)) {
        await e.reply(`\n群『${groupId}』的进群通知目前已经处于开启状态`, { at: true });
        return true;
    }
    delYaml('other', 'accept.disable_list', groupId);
    await e.reply(`\n已经开启群『${groupId}』的进群通知`, { at: true });
    return true;
}, { permission: 'master' });
export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
    const cfg = other();
    if (e.msg.includes('关闭')) {
        if (!cfg.joinGroup.includes(e.groupId)) {
            await e.reply('\n进群验证已经处于关闭状态', { at: true });
            return true;
        }
        delYaml('other', 'joinGroup', e.groupId);
        await e.reply('\n已关闭进群验证', { at: true });
        return true;
    }
    if (cfg.joinGroup.includes(e.groupId)) {
        await e.reply('\n进群验证已经处于开启状态', { at: true });
        return true;
    }
    addYaml('other', 'joinGroup', e.groupId);
    await e.reply('\n已开启进群验证', { at: true });
    return true;
}, { name: '进群验证', perm: 'group.admin', event: 'message.group' });
