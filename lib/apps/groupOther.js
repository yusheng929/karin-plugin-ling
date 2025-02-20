import moment from 'node-karin/moment';
import { karin, segment, common, logger } from 'node-karin';
/**
 * 改群名
 */
export const ModifyGroupName = karin.command(/^#改群名/, async (e) => {
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!info.role || !(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    const Name = e.msg.replace(/^#改群名/, '').trim();
    if (!Name) {
        e.reply('群名不能为空', { at: true });
        return true;
    }
    try {
        await e.bot.setGroupName(e.groupId, Name);
        e.reply(`已经将群名修改为『${Name}』`);
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        logger.error(error);
        return true;
    }
    return true;
}, { name: '改群名', priority: -1, event: 'message.group', perm: 'group.admin' });
/**
 * 获取禁言列表
*/
export const MuteList = karin.command(/^#?(获取|查看)?禁言列表$/, async (e) => {
    const lsit = [];
    const result = await e.bot.getGroupMuteList(e.groupId);
    if (!result.length) {
        e.reply('\n没有被禁言的人哦~', { at: true });
        return true;
    }
    for (const item of result) {
        lsit.push(...[
            segment.image(await e.bot.getAvatarUrl(item.userId)),
            segment.text(`\nQQ号: ${item.userId}`),
            segment.text(`\n禁言剩余: ${moment(item.muteTime - Date.now()).format('HH:mm:ss')}`),
            segment.text(`\n禁言到期: ${moment(item.muteTime * 1000).format('YYYY-MM-DD HH:mm:ss')}`),
        ]);
    }
    lsit.unshift(segment.text(`禁言列表如下(共${result.length}人):`));
    const content = common.makeForward(lsit, e.selfId, e.bot.account.name);
    await e.bot.sendForwardMsg(e.contact, content);
    return true;
}, { name: '获取禁言列表', priority: -1, event: 'message.group' });
export const ModifyMemberCard = karin.command(/^#改群昵称/, async (e) => {
    const Name = e.msg.replace(/^#改群昵称/, '').trim();
    if (!Name) {
        e.reply('群昵称不能为空', { at: true });
        return true;
    }
    try {
        await e.bot.setGroupMemberCard(e.groupId, e.selfId, Name);
        await e.reply(`已经将群昵称修改为『${Name}』`);
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
    return true;
}, { name: '改群昵称', priority: -1, permission: 'master', event: 'message.group' });
export const SetEssence = karin.command(/^#?(加|设|移)精$/, async (e) => {
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!info.role || !(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    if (!e.replyId) {
        e.reply('请回复需要设置精华的消息');
        return true;
    }
    try {
        await e.bot.setGgroupHighlights(e.groupId, e.replyId, e.msg.includes('加') || e.msg.includes('设'));
        await e.reply('操作成功', { at: true });
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
    return true;
}, { name: '处理精华消息', priority: -1, event: 'message.group', perm: 'group.admin' });
