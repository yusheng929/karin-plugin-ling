import { karin } from 'node-karin';
/**
 * 给全部主人、管理员发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export declare const sendToAllAdmin: (selfId: string, message: Parameters<typeof karin.sendMsg>[2]) => Promise<void>;
