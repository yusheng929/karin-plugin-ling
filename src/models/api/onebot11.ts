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
   * @param domain QQ域名
   * @returns 返回账号的cookies
   */
  async ck (domain: string) {
    const { cookies } = await this.e.bot.sendApi!('get_cookies', { domain })
    this.cookies = cookies
    return this.cookies
  }

  /**
   * 获取bkn
   * @returns bkn
    */
  async bkn (skey: string = this.cookies.match(/skey=(.+?);/)?.[1] || '') {
    const { token } = await this.e.bot.sendApi!('get_csrf_token', {})
    return token
    // let bkn = 5381
    // for (const v of skey) {
    //  bkn = bkn + (bkn << 5) + v.charCodeAt(0)
    // }
    // bkn &= 2147483647
    // return bkn
  }
}
