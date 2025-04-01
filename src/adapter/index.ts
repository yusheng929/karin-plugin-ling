import { Message } from 'node-karin'
import { Client } from 'icqq'
import { Domain } from '@/types/adapter'

export default class Adapter {
  cookies: string
  e: Message
  token: number
  constructor (e: Message) {
    this.cookies = ''
    this.token = 5138
    this.e = e
  }

  /**
   * 获取QQ账号的cookie
   * @param domain QQ域名
   * @returns 返回账号的cookies
   */
  async ck (domain: Domain) {
    if (this.e.bot.adapter.standard === 'onebot11') {
      const { cookies } = await this.e.bot.sendApi!('get_cookies', { domain })
      this.cookies = cookies
    }
    if (this.e.bot.adapter.standard === 'icqq') {
      this.cookies = (this.e.bot.super as Client).getCookies(domain)
    }
    return this.cookies
  }

  /**
   * 获取bkn
   * @returns bkn
    */
  async bkn (skey: string = this.cookies.match(/skey=(.+?);/)?.[1] || '') {
    if (this.e.bot.adapter.standard === 'onebot11') {
      const { token } = await this.e.bot.sendApi!('get_csrf_token', {})
      this.token = token
    }
    if (this.e.bot.adapter.standard === 'icqq') {
      this.token = (this.e.bot.super as Client).getCsrfToken()
    }
    return this.token
    // let bkn = 5381
    // for (const v of skey) {
    //  bkn = bkn + (bkn << 5) + v.charCodeAt(0)
    // }
    // bkn &= 2147483647
    // return bkn
  }
}
