import type { Message } from 'node-karin';
export default class {
    e: Message;
    headers: Record<string, string>;
    constructor(e: Message);
    /**
     * 获取群幸运字符列表
     * @param groupId 群号
     * @param start
     * @param limit
     * @returns 幸运字符列表
     */
    luckylist(groupId: string, start?: number, limit?: number): Promise<any>;
    /**
     * 获取群幸运字符
     * @param groupId 群号
     * @returns 抽幸运字符结果
     */
    luckyword(groupId: string): Promise<any>;
    /**
     * 设置群幸运字符
     * @param groupId 群号
     * @param type true: 开启 false: 关闭
     * @returns 设置结果
     */
    lucksetting(groupId: string, type: boolean): Promise<any>;
    /**
     * 点亮群幸运字符
     * @param groupId 群号
     * @param wordId 字符ID
     * @returns 点亮结果
     */
    luckequip(groupId: string, wordId: string): Promise<any>;
    /**
     * 发送群公告
     * @param groupId 群号
     * @param msg 内容
     * @param img 图片链接(如果有图片的话)
     * @returns 上传结果
     */
    sendAnnouncs(groupId: string, msg: string, img: string | undefined): Promise<any>;
    /**
     * 获取群公告列表
     * @param groupId 群号
     * @returns 公告列表
     */
    announcelist(groupId: string): Promise<any>;
    /**
     * 上传图片到qq服务器
     * @param url 图片链接
     * @returns 上传内容
     */
    uploadImg(url: string): Promise<any>;
    /**
     * 获取网络图片的Buffer
     * @param url 图片拦链接
     * @returns 图片的Buffer
     */
    getImageBuffer(url: string): Promise<Buffer<ArrayBuffer>>;
}
