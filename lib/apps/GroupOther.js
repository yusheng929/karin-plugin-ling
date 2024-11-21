import moment from 'node-karin/moment';
import { karin, segment, common } from 'node-karin';
/**
 * 改群名
 */
export const ModifyGroupName = karin.command(/^#改群名/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    const Name = e.msg.replace(/^#改群名/, '').trim();
    if (!Name) {
        e.reply('群名不能为空', { at: true });
        return true;
    }
    try {
        await e.bot.ModifyGroupName(e.group_id, Name);
        e.reply(`已经将群名修改为『${Name}』`);
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
    return true;
}, { name: '改群名', priority: -1 });
/**
 * 获取禁言列表
*/
export const MuteList = karin.command(/^#?(获取|查看)?禁言列表$/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    const lsit = [];
    const res = await e.bot.GetProhibitedUserList(e.group_id);
    if (!res.length) {
        e.reply('\n没有被禁言的人哦~', { at: true });
        return true;
    }
    res.forEach((item) => {
        lsit.push([
            segment.image(e.bot.getAvatarUrl(item.uid)),
            segment.text(`\nQQ号: ${item.uid}`),
            segment.text(`\n禁言剩余: ${moment(item.prohibited_time - Date.now()).format('HH:mm:ss')}`),
            segment.text(`\n禁言到期: ${moment(item.prohibited_time * 1000).format('YYYY-MM-DD HH:mm:ss')}`),
        ]);
    });
    lsit.unshift(segment.text(`禁言列表如下(共${res.length}人):`));
    const content = common.makeForward(lsit, e.self_id, e.bot.account.name);
    await e.bot.sendForwardMessage(e.contact, content);
    return true;
});
export const ModifyMemberCard = karin.command(/^#改群昵称/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    const Name = e.msg.replace(/^#改群昵称/, '').trim();
    if (!Name) {
        e.reply('群昵称不能为空', { at: true });
        return true;
    }
    try {
        await e.bot.ModifyMemberCard(e.group_id, e.self_id, Name);
        await e.reply(`已经将群昵称修改为『${Name}』`);
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
    return true;
}, { name: '改群昵称', priority: -1, permission: 'master' });
export const SetEssence = karin.command(/^#?(加|设|移)精$/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    if (!e.reply_id) {
        e.reply('请回复需要设置精华的消息');
        return true;
    }
    try {
        await e.bot.SetEssenceMessage(e.group_id, e.reply_id);
        await e.reply('设置精华成功');
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
    return true;
}, { name: '设置精华', priority: -1 });
