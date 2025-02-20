import { Message } from 'node-karin';
export default class {
    cookies: string;
    e: Message;
    constructor(e: Message);
    /**
     * 获取QQ账号的cookie
     * @param domain QQ域名
     * @returns 返回账号的cookies
     */
    ck(domain: string): Promise<string>;
    /**
     * 获取bkn
     * @returns bkn
      */
    bkn(skey?: string): Promise<number>;
}
