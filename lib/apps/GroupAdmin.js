import { config, karin } from 'node-karin';
import { translateChinaNum } from '../components/Number.js';
// const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'
/**
 * 全体禁言
 */
export const muteAll = karin.command(/^#?全体(禁言|解禁)$/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    /** 只有主人 群管理员可以使用 */
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    /** 检查bot自身是否为管理员、群主 */
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    const isBan = /全体禁言/.test(e.msg);
    try {
        await e.bot.setGroupAllMute(e.groupId, isBan);
        await e.reply(`已${isBan ? '开启' : '关闭'}全体禁言`);
        return true;
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
}, { name: '全体禁言', priority: -1, perm: 'group.admin' });
/**
 * 设置/取消管理员
 */
export const setAdmin = karin.command(/^#(设置|取消)管理/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    /** 只有bot为群主才可以使用 */
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner'].includes(info.role))) {
        await e.reply('少女不是群主，做不到呜呜~(>_<)~');
        return true;
    }
    let userId = '';
    /** 存在at */
    if (e.at.length) {
        userId = e.at[0];
    }
    else {
        userId = e.msg.replace(/#|(设置|取消)管理/, '').trim();
    }
    if (!userId || !(/\d{5,}/.test(userId))) {
        await e.reply('\n貌似这个QQ号不对哦~', { at: true });
        return true;
    }
    try {
        const res = await e.bot.getGroupMemberInfo(e.groupId, userId);
        if (!res) {
            await e.reply('\n这个群好像没这个人', { at: true });
            return true;
        }
    }
    catch {
        e.reply('\n这个群好像没这个人', { at: true });
        return true;
    }
    const isSet = e.msg.includes('设置');
    try {
        await e.bot.setGroupAdmin(e.groupId, userId, isSet);
        await e.reply(`\n${isSet ? '设置' : '取消'}管理员成功`, { at: true });
        return true;
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
}, { name: '设置管理', priority: -1, permission: 'master' });
/**
 * 设置群头衔
 */
export const setGroupTitle = karin.command(/^#(申请|我要)头衔/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    /** 只有bot为群主才可以使用 */
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner'].includes(info.role))) {
        await e.reply('少女不是群主，做不到呜呜~(>_<)~');
        return true;
    }
    const title = e.msg.replace(/#(申请|我要)头衔/, '').trim();
    try {
        if (!title) {
            await e.bot.setGroupMemberTitle(e.groupId, e.userId, title);
            await e.reply('\n已经将你的头衔取消了~', { at: true });
            return true;
        }
        await e.bot.setGroupMemberTitle(e.groupId, e.userId, title);
        await e.reply('\n换上了哦', { at: true });
        return true;
    }
    catch (error) {
        await e.reply(`\n错误:\n${error.message}`, { at: true });
        return true;
    }
}, { name: '申请头衔', priority: -1 });
/**
 * 踢人
 */
export const kickMember = karin.command(/^#踢/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    /** 只有主人、群主、管理员可以使用 */
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    let userId = '';
    /** 存在at */
    if (e.at.length) {
        userId = e.at[0];
    }
    else {
        userId = e.msg.replace(/#踢/g, '').trim();
    }
    if (!userId || !(/\d{5,}/.test(userId))) {
        await e.reply('\n貌似这个QQ号不对哦~', { at: true });
        return true;
    }
    /** 检查bot自身是否为管理员、群主 */
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    try {
        const res = await e.bot.getGroupMemberInfo(e.groupId, userId);
        if (!res) {
            await e.reply('\n这个群好像没这个人', { at: true });
            return true;
        }
        /** 检查对方的角色 */
        if (res.role === 'owner') {
            await e.reply('\n这个人是群主，少女做不到呜呜~(>_<)~', { at: true });
            return true;
        }
        if (res.role === 'admin') {
            await e.reply('\n少女不能踢出管理员呜呜~(>_<)~', { at: true });
            return true;
        }
    }
    catch {
        e.reply('\n这个群好像没这个人', { at: true });
        return true;
    }
    try {
        await e.bot.groupKickMember(e.groupId, userId);
        await e.reply(`\n已经将用户『${userId}』踢出群聊`, { at: true });
        return true;
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
}, { name: '踢', priority: -1 });
/**
 * 解禁
 */
export const UnBanMember = karin.command(/^#解禁/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    let userId = '';
    /** 存在at */
    if (e.at.length) {
        userId = e.at[0];
    }
    else {
        userId = e.msg.replace(/#解禁/g, '').trim();
    }
    if (!userId || !(/\d{5,}/.test(userId))) {
        await e.reply('\n貌似这个QQ号不对哦~', { at: true });
        return true;
    }
    try {
        const res = await e.bot.getGroupMemberInfo(e.groupId, userId);
        if (!res) {
            await e.reply('\n这个群好像没这个人', { at: true });
            return true;
        }
        /** 检查对方的角色 */
        if (res.role === 'owner') {
            await e.reply('\n这个人是群主，少女做不到呜呜~(>_<)~', { at: true });
            return true;
        }
        if (res.role === 'admin') {
            /** 需要是群主 */
            if (info.role !== 'owner') {
                await e.reply('\n这个人是管理员，少女做不到呜呜~(>_<)~', { at: true });
                return true;
            }
        }
    }
    catch {
        e.reply('\n这个群好像没这个人', { at: true });
        return true;
    }
    try {
        await e.bot.setGroupMute(e.groupId, userId, 0);
        await e.reply(`\n已经将用户『${userId}』解除禁言了`, { at: true });
        return true;
    }
    catch (error) {
        await e.reply('\n错误: 未知原因❌', { at: true });
        return true;
    }
}, { name: '解禁', priority: -1 });
export const BanMember = karin.command(/^#?禁言(\d+|[零一壹二两三四五六七八九十百千万亿]+)?(秒|分|分钟|时|小时|天)?/, async (e) => {
    if (!e.isGroup) {
        e.reply('请在群聊中执行');
        return true;
    }
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
        await e.reply('暂无权限，只有管理员才能操作');
        return true;
    }
    const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId);
    if (!(['owner', 'admin'].includes(info.role))) {
        await e.reply('少女做不到呜呜~(>_<)~');
        return true;
    }
    let userId = '';
    /** 存在at */
    if (e.at.length) {
        userId = e.at[0];
    }
    else {
        e.reply('请艾特对方使用');
        return true;
    }
    if (!userId || !(/\d{5,}/.test(userId))) {
        await e.reply('\n貌似这个QQ号不对哦~', { at: true });
        return true;
    }
    try {
        const res = await e.bot.getGroupMemberInfo(e.groupId, userId);
        const Master = config.master();
        if (res.role === 'owner') {
            await e.reply('\n这个人是群主，少女做不到呜呜~(>_<)~', { at: true });
            return true;
        }
        if (res.role === 'admin') {
            /** 需要是群主 */
            if (info.role !== 'owner') {
                await e.reply('\n这个人是管理员，少女做不到呜呜~(>_<)~', { at: true });
                return true;
            }
        }
        if (Master.includes(userId)) {
            await e.reply('不能禁言主人', { at: true });
            return true;
        }
    }
    catch {
        e.reply('\n这个群好像没这个人', { at: true });
        return true;
    }
    const match = e.msg.match(/^#?禁言(\d+|[零一壹二两三四五六七八九十百千万亿]+)?(秒|分|分钟|时|小时|天)?/);
    if (match) {
        const timeStr = match[1] || 600;
        const unit = match[2] || '秒'; // 默认为秒
        const time = translateChinaNum(timeStr.toString());
        let timeInSeconds;
        switch (unit) {
            case '秒':
                timeInSeconds = time;
                break;
            case '分':
            case '分钟':
                timeInSeconds = time * 60;
                break;
            case '时':
            case '小时':
                timeInSeconds = time * 60 * 60;
                break;
            case '天':
                timeInSeconds = time * 60 * 60 * 24;
                break;
            default:
                timeInSeconds = time;
        }
        e.bot.setGroupMute(e.groupId, userId, timeInSeconds);
        await e.reply(`\n已经将用户『${userId}』禁言了`, { at: true });
        return true;
    }
    return false;
}, { name: '禁言', priority: -1 });
