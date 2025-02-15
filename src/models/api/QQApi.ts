import axios from 'node-karin/axios'
import { logger } from 'node-karin'
import type { Message } from 'node-karin'
import Onebot11 from './onebot11'

export default class {
  e: Message
  headers: Record<string, string>
  constructor (e: Message) {
    this.e = e
    this.headers = {
      Cookie: '',
      'Content-type': 'application/json;charset=UTF-8',
      'qname-service': '976321:131072',
      'qname-space': 'Production',
    }
  }

  /**
   * 获取群幸运字符列表
   * @param groupId 群号
   * @param start
   * @param limit
   * @returns 幸运字符列表
   */
  async luckylist (groupId: string, start: number = 0, limit: number = 20) {
    const body = JSON.stringify({
      group_code: groupId,
      start,
      limit,
      need_equip_info: true
    })
    const onebot11 = new Onebot11(this.e)
    this.headers.Cookie = await onebot11.ck('qun.qq.com')
    const bkn = await onebot11.bkn()
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/word_list?bkn=${bkn}`,
      headers: this.headers,
      data: body
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 获取群幸运字符
   * @param groupId 群号
   * @returns 抽幸运字符结果
   */
  async luckyword (groupId: string) {
    const body = JSON.stringify({
      group_code: groupId
    })
    const onebot11 = new Onebot11(this.e)
    this.headers.Cookie = await onebot11.ck('qun.qq.com')
    const bkn = await onebot11.bkn()
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/draw_lottery?bkn=${bkn}`,
      headers: this.headers,
      data: body
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }
}
