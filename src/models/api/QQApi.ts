import axios from 'axios'
import { logger } from 'node-karin'

export default class {
  headers: any
  e: any
  constructor (e: any) {
    this.e = e
    this.headers = {
      'Content-type': 'application/json;charset=UTF-8',
      Cookie: e.bot?.cookies?.['qun.qq.com'],
      'qname-service': '976321:131072',
      'qname-space': 'Production',
    }
  }

  async luckylist (groupId: string, start = 0, limit = 20) {
    const body = JSON.stringify({
      group_code: groupId,
      start,
      limit,
      need_equip_info: true
    })
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/word_list?bkn=${this.e.bot.bkn}`,
      headers: this.headers,
      data: body
    }
    return axios.request(request).then(res => res.data).catch(err => logger.error(err))
  }
}
