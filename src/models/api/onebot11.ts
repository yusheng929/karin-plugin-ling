import { Message } from 'node-karin'

export default class {
  cookies: string
  e: Message
  constructor (e: Message) {
    this.cookies = ''
    this.e = e
  }

  /**
   * 获取QQ账号的cookie
   * @returns {Promise<string>} 返回账号的cookies
   */
  async ck (): Promise<string> {
    const { cookies } = await this.e.bot.sendApi!('get_cookies', { domain: 'qun.qq.com' })
    this.cookies = cookies
    return this.cookies
  }

  /**
   * 获取bkn
   * @param {string} skey QQ账号的skey
   * @returns {Promise<number>} bkn
    */
  async bkn (skey: string = this.cookies.match(/skey=(.+?);/)?.[1] || ''): Promise<number> {
    let bkn = 5381
    for (const v of skey) {
      bkn = bkn + (bkn << 5) + v.charCodeAt(0)
    }
    bkn &= 2147483647
    return bkn
  }
}
