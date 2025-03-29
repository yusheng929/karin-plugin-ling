import { karin, GroupMessage } from 'node-karin';
/**
 * 给全部主人、管理员发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export declare const sendToAllAdmin: (selfId: string, message: Parameters<typeof karin.sendMsg>[2]) => Promise<void>;
/**
 * @description 给指定主人发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export declare const sendToFirstAdmin: (selfId: string, message: Parameters<typeof karin.sendMsg>[2]) => Promise<void>;
/**
 * @description 判断bot自身是否是群管理
 * @param e 群消息实例
 * @param owner 判断群主权限，默认false，为true则只判断群主权限，false判断管理员权限
 * @returns 返回true或者false
 */
export declare const isAdmin: (e: GroupMessage, owner?: boolean) => Promise<boolean>;
/**
 * @description 当前群是否存在某人
 * @param e 群消息实例
 * @param uid 目标用户id
 * @returns 返回false或者true
 */
export declare const GroupMemberExist: (e: GroupMessage, uid: string) => Promise<boolean>;
/**
 * @description 判断某人权限是否大于自己
 * @param e 群消息实例
 * @param uid 目标用户id
 */
export declare const JudgePerim: (e: GroupMessage, uid: string) => Promise<boolean>;
