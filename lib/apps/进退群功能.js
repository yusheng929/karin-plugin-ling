import { karin, Cfg, segment } from 'node-karin';
import { Config, Edit } from '../components/index.js';
export const deal_invited_group = karin.accept('request.invited_group', async (e) => {
    const opts = Config.Other.DealRequest.InvitedJoinGroup;
    if (opts.accept) {
        await e.bot.SetInvitedJoinGroupResult(e.raw_event.flag, true);
    }
    if (!opts.notify)
        return false;
    const AvatarUrl = e.bot.getGroupAvatarUrl(e.group_id);
    Cfg.master.concat(Cfg.admin).forEach(master => {
        try {
            e.bot.SendMessage({
                scene: 'friend', peer: master,
                sub_peer: null
            }, [
                segment.image(AvatarUrl),
                segment.text(`接到群『${e.group_id}』的拉群申请， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}`)
            ]);
        }
        catch (error) { }
        return true;
    });
    return true;
}, {
    name: '处理拉群申请',
    priority: 100,
    log: true
});
export const deal_private_apply = karin.accept('request.private_apply', async (e) => {
    const opts = Config.Other.DealRequest.Friend;
    if (opts.accept) {
        await e.bot.SetFriendApplyResult(e.raw_event.flag, true);
    }
    if (!opts.notify)
        return false;
    const AvatarUrl = e.bot.getAvatarUrl(e.user_id);
    Cfg.master.concat(Cfg.admin).forEach(master => {
        try {
            e.bot.SendMessage({
                scene: 'friend', peer: master,
                sub_peer: null
            }, [
                segment.image(AvatarUrl),
                segment.text(`接到${e.sender.nick || ''}『${e.user_id}』的好友申请， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
            ]);
        }
        catch (error) { }
    });
    return true;
}, {
    name: '处理加好友申请',
    priority: 100,
    log: true
});
export const deal_group_apply = karin.accept('request.group_apply', async (e) => {
    console.log(`${e.request_id}`);
    const opts = Array.isArray(Config.Other.DealRequest.Group) ? Config.Other.DealRequest.Group.find((group) => group[e.group_id])[e.group_id] : Config.Other.DealRequest.Group;
    if (!opts)
        return false;
    if (opts.accept) {
        await e.bot.SetGroupApplyResult(e.raw_event.flag, true);
    }
    if (!opts.notify)
        return false;
    const AvatarUrl = e.bot.getAvatarUrl(e.user_id);
    const GroupAvatarUrl = e.bot.getGroupAvatarUrl(e.group_id);
    Cfg.master.concat(Cfg.admin).forEach(master => {
        try {
            e.bot.SendMessage({
                scene: 'friend', peer: master,
                sub_peer: null
            }, [
                segment.image(GroupAvatarUrl),
                segment.text(`接到群『${e.group_id}』的加群申请，申请人${e.sender.nick || ''}『${e.user_id}』， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
            ]);
        }
        catch (error) { }
    });
    e.bot.SendMessage({
        scene: 'group', peer: e.group_id,
        sub_peer: null
    }, [
        segment.image(AvatarUrl),
        segment.text(`接到${e.sender.nick || ''}『${e.user_id}』的加群申请。 ${opts.accept ? '已处理。' : ''}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
    ]);
    return true;
}, {
    name: '处理加群申请',
    priority: 100,
    log: true
});
export const Notification = karin.command(/^#(开启|关闭)进群通知/, async (e) => {
    let group_id = e.msg.replace(/#(开启|关闭)进群通知/, '').trim() || e.group_id;
    if (!group_id) {
        e.reply('请输入正确的群号');
        return false;
    }
    if (e.msg.includes('关闭')) {
        await Edit.EditAddend(e, `已经关闭群『${group_id}』的进群通知`, `群『${group_id}』的进群通知已经处于关闭状态`, 'accept.BlackGroup', group_id, 'other');
        return true;
    }
    if (e.msg.includes('开启')) {
        await Edit.EditRemove(e, `已经开启群『${group_id}』的进群通知`, `群『${group_id}』的进群通知目前已经处于开启状态`, 'accept.BlackGroup', group_id, 'other');
        return true;
    }
    return true;
}, { permission: 'master' });
export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return false;
    }
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return false;
    }
    if (e.msg.includes('关闭')) {
        await Edit.EditRemove(e, '已关闭进群验证', '进群验证已经处于关闭状态', 'Test', e.group_id, 'other');
        return true;
    }
    if (e.msg.includes('开启')) {
        await Edit.EditAddend(e, '已开启进群验证', '进群验证已经处于开启状态', 'Test', e.group_id, 'other');
        return true;
    }
    return true;
});
