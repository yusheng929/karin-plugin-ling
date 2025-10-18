import axios from 'node-karin/axios'
import { logger } from 'node-karin'
import type { Message } from 'node-karin'
import qs from 'qs'

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
    const data = JSON.stringify({
      group_code: groupId,
      start,
      limit,
      need_equip_info: true
    })
    this.headers.Cookie = (await this.e.bot.getCookies('qun.qq.com')).cookie
    const bkn = (await this.e.bot.getCSRFToken()).token
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/word_list?bkn=${bkn}`,
      headers: this.headers,
      data
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
    const data = JSON.stringify({
      group_code: groupId
    })
    this.headers.Cookie = (await this.e.bot.getCookies('qun.qq.com')).cookie
    const bkn = (await this.e.bot.getCSRFToken()).token
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/draw_lottery?bkn=${bkn}`,
      headers: this.headers,
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 设置群幸运字符
   * @param groupId 群号
   * @param type true: 开启 false: 关闭
   * @returns 设置结果
   */
  async lucksetting (groupId: string, type: boolean) {
    const data = JSON.stringify({
      group_code: groupId,
      cmd: type ? 1 : 2
    })
    this.headers.Cookie = (await this.e.bot.getCookies('qun.qq.com')).cookie
    const bkn = (await this.e.bot.getCSRFToken()).token
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/setting?bkn=${bkn}`,
      headers: this.headers,
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 点亮群幸运字符
   * @param groupId 群号
   * @param wordId 字符ID
   * @returns 点亮结果
   */
  async luckequip (groupId: string, wordId: string) {
    const data = JSON.stringify({
      group_code: groupId,
      word_id: wordId
    })
    this.headers.Cookie = (await this.e.bot.getCookies('qun.qq.com')).cookie
    const bkn = (await this.e.bot.getCSRFToken()).token
    const request = {
      method: 'POST',
      url: `https://qun.qq.com/v2/luckyword/proxy/domain/qun.qq.com/cgi-bin/group_lucky_word/equip?bkn=${bkn}`,
      headers: this.headers,
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 发送群公告
   * @param groupId 群号
   * @param msg 内容
   * @param img 图片链接(如果有图片的话)
   * @returns 上传结果
   */
  async sendAnnouncs (groupId: string, msg: string, img: string | undefined) {
    const bkn = (await this.e.bot.getCSRFToken()).token
    const bodyObj: Record<string, (string | number)> = {
      qid: groupId,
      bkn,
      text: msg,
      pinned: 0,
      type: 1,
      settings: '{ is_show_edit_card: 1, tip_window_type: 1, confirm_required: 1 }'
    }
    if (img) {
      const res = await this.uploadImg(img)
      if (res.ec === 0) {
        const pic = JSON.parse(res.id.replace(/&quot;/g, '"'))
        bodyObj.pic = pic.id
        bodyObj.imgWidth = pic.w
        bodyObj.imgHeight = pic.h
      }
    }
    const data = qs.stringify(bodyObj)
    const request = {
      method: 'POST',
      url: `https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=${bkn}`,
      headers: {
        Cookie: (await this.e.bot.getCookies('qun.qq.com')).cookie,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 获取群公告列表
   * @param groupId 群号
   * @returns 公告列表
   */
  async announcelist (groupId: string) {
    const bkn = (await this.e.bot.getCSRFToken()).token
    const data = qs.stringify({
      qid: groupId,
      bkn,
      ft: '23',
      n: '20',
      s: '-1'
    })
    const request = {
      method: 'POST',
      url: `https://web.qun.qq.com/cgi-bin/announce/list_announce??bkn=${bkn}`,
      headers: {
        Cookie: (await this.e.bot.getCookies('qun.qq.com')).cookie
      },
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 上传图片到qq服务器
   * @param url 图片链接
   * @returns 上传内容
   */
  async uploadImg (url: string) {
    const bkn = (await this.e.bot.getCSRFToken()).token
    const buffer = await this.getImageBuffer(url)
    const cookies = (await this.e.bot.getCookies('qun.qq.com')).cookie
    const data = new FormData()
    data.append('bkn', String(bkn))
    data.append('source', 'troopNotics')
    data.append('m', '0')
    data.append('pic_up', new Blob([buffer]), '_-1537414416_1735663690596_1735663690653_wifi_0.jpg')
    const request = {
      method: 'POST',
      url: 'https://web.qun.qq.com/cgi-bin/announce/upload_img',
      headers: {
        Cookie: cookies
      },
      data
    }
    return axios
      .request(request)
      .then(res => res.data)
      .catch(err => logger.error(err))
  }

  /**
   * 获取网络图片的Buffer
   * @param url 图片拦链接
   * @returns 图片的Buffer
   */
  async getImageBuffer (url: string) {
    try {
      const data = await axios.get(url, {
        responseType: 'arraybuffer'
      })
      if (data.status !== 200) throw new Error('网络不正常')
      const buffer = Buffer.from(data.data, 'binary')
      return buffer
    } catch (error) {
      logger.error(error)
      throw new Error('处理图片失败')
    }
  }
}
