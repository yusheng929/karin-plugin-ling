import { other } from '../../utils/config.js';
/**
 * @description 是否跳过处理
 * @param e 消息事件对象
 * @returns 返回`true`跳过处理，返回`false`继续处理
 */
export const shouldSkipProcessing = (e) => {
    if (e.msg.includes('上班') || e.msg.includes('下班'))
        return true;
    if (other().noWork.includes(e.groupId))
        return true;
    return false;
};
/**
 * @description 是否为特权用户
 * @param e 消息事件对象
 * @returns 返回`true`是特权用户，返回`false`不是特权用户
 */
export const isPrivilegedUser = (e) => {
    return e.isMaster || e.isAdmin || ['owner', 'admin'].includes(e.sender.role);
};
/**
 * @description 检查违规
 * @param words 违规词列表
 * @param rule 匹配规则
 * @param msg 消息内容
 * @returns 返回`true`违规，返回`false`不违规
 */
export const checkViolation = (words, rule, msg) => {
    return rule === 1
        ? words.some(reg => reg === msg)
        : words.some(reg => new RegExp(reg).test(msg));
};
/**
 * @description 处理违规
 * @param e 消息事件对象
 * @returns 返回`true`退出处理，返回`false`继续处理
 */
export const handleViolation = async (e) => {
    await e.reply('\n请不要发布违规内容', { at: true });
    if (isPrivilegedUser(e))
        return false;
    await e.bot.recallMsg(e.contact, e.messageId);
    return true;
};
// /**
//  * @description 使用中间件监听消息事件
//  */
// export const use = karin.use('recvMsg', async (e, pass, next, exit) => {
//   if (!pass) return next()
//   if (!e.isGroup) return next()
//   if (shouldSkipProcessing(e)) return next()
//   const list = group()
//   const config = list[e.groupId] || list.default
//   /** 规则不存在或者已禁用 */
//   if (!config || !config.enable) return next()
//   /** 检查发送的消息是否违规 */
//   const isViolating = checkViolation(config.words, config.rule, e.msg)
//   if (!isViolating) return next()
//   /** 处理违规 */
//   const shouldExit = await handleViolation(e)
//   return shouldExit ? exit() : next()
// })
