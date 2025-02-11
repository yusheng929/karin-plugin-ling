import axios from 'axios'
import { logger } from 'node-karin'
import type { Message } from 'node-karin'

export default class {
  e: Message
  headers: Record<string, string>
  constructor (e: Message) {
    this.e = e
    this.headers = {}
  }

  async luckylist (groupId: string, start = 0, limit = 20) {
    const { cookie } = await this.e.bot.getCookies('qun.qq.com')
    this.headers = {
      cookie,
      'Content-type': 'application/json;charset=UTF-8',
      'qname-service': '976321:131072',
      'qname-space': 'Production',
    }
    const body = JSON.stringify({
      group_code: groupId,
      start,
      limit,
      need_equip_info: true
    })
    const request = {
      method: 'POST',
      // url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/word_list?bkn=${this.e.bot.bkn}`,
      headers: this.headers,
      data: body
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }
}
