import { Message } from 'node-karin'
import type { Client } from 'icqq'
import { Domain } from '@/types/adapter'
import { Rkeys, RkeysData } from '@/types/rkeys'

export default class Adapter {
  cookies: string
  e: Message
  bkn: number
  rkey: RkeysData
  constructor (e: Message) {
    this.cookies = ''
    this.bkn = 5138
    this.e = e
    this.rkey = {
      type: 'group',
      rkey: '',
      created_at: 0,
      ttl: 0
    }
  }

  /**
   * 获取QQ账号的cookie
   * @param domain QQ域名
   * @returns 返回账号的cookies
   */
  async getck (domain: Domain) {
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
  async getbkn (skey: string = this.cookies.match(/skey=(.+?);/)?.[1] || '') {
    if (this.e.bot.adapter.standard === 'onebot11') {
      const { token } = await this.e.bot.sendApi!('get_csrf_token', {})
      this.bkn = token
    }
    if (this.e.bot.adapter.standard === 'icqq') {
      this.bkn = (this.e.bot.super as Client).getCsrfToken()
    }
    return this.bkn
    // let bkn = 5381
    // for (const v of skey) {
    //  bkn = bkn + (bkn << 5) + v.charCodeAt(0)
    // }
    // bkn &= 2147483647
    // return bkn
  }

  /**
   * 获取rkey
   * @param type 使用场景(group|private)
   * @returns rkey
   */
  async getrkey (type: 'group' | 'private') {
    if (this.e.bot.adapter.standard === 'onebot11') {
      const rkeys = await (this.e.bot as any).sendApi('get_rkey', {}) as Rkeys
      this.rkey = (type === 'group' ? rkeys.rkeys.find((item) => item.type === 'group') : rkeys.rkeys.find((item) => item.type === 'private')) || {
        type: 'group',
        rkey: '',
        created_at: 0,
        ttl: 0
      }
      return this.rkey
    }
  }
}
