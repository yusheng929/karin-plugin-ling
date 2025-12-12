export interface luckyWordList {
  equip_info: {
    word_info: {
      /** 字符ID */
      word_id: string,
      /** 字符总字数 */
      char_count: number,
      /** 字符内容 */
      wording: string,
      /** 字符寓意 */
      word_desc: string,
      /** 字符图床 */
      url_prefix: string,
      /** 字符时间戳 */
      mtime: string,
      /** 意义不明 */
      charge_type: number,
    },
    /** 字符点亮详情 */
    light_up_info: lightUpInfo,
    /** 意义不明 */
    light_up_cfg: lightUpCfg,
    /** 抽中该字符的用户 */
    chosen_uin: string,
    /** 抽中的时间戳 */
    chosen_time: number,
    /** 抽中字符的用户昵称 */
    chosen_nick: string
  },
  /** 字符列表 */
  word_list: wordList[],
  next_pos: -1,
  /** 字符是否关闭 */
  is_lucky_word_closed: false,
  member_privilege: 2
}

export interface luckyWord {
  word_info: {
    /** 字符详情 */
    word_info: wordInfo,
    /** 抽中该字符的用户 */
    chosen_uin: string,
    /** 抽中的时间戳 */
    chosen_time: number
  }
}

interface wordList {
  /** 字符详情 */
  word_info: wordInfo,
  /** 字符点亮详情 */
  light_up_info: lightUpInfo
}
interface wordInfo {
  /** 字符ID */
  word_id: string,
  /** 字符总字数 */
  char_count: number,
  /** 字符内容 */
  wording: string,
  /** 字符寓意 */
  word_desc: string,
  /** 字符图床 */
  url_prefix: string,
  /** 字符时间戳 */
  mtime: string,
  /** 意义不明 */
  charge_type: number,
  light_up_cfgs: lightUpCfg[]
}
interface lightUpCfg {
  group_member_min_count: number,
  group_member_max_count: number,
  chat_count_per_char: number,
  max_chat_count_per_day: number
}
interface lightUpInfo {
  /** 已点亮单词数 */
  light_up_char_count: number,
  cur_char_chat_count: number,
  /** 聊天次数 */
  total_chat_count: number,
  /** 最后点亮时间戳 */
  last_chat_time: number,
  /** 第一次点亮一个字符时间戳 */
  first_chat_time: number,
  /** 点亮字符总时间戳 */
  light_up_all_time: number
}

export type Domain = 'aq.qq.com' | 'buluo.qq.com' | 'connect.qq.com' | 'docs.qq.com' | 'game.qq.com' | 'gamecenter.qq.com' | 'haoma.qq.com' | 'id.qq.com' | 'kg.qq.com' | 'mail.qq.com' | 'mma.qq.com' | 'office.qq.com' | 'openmobile.qq.com' | 'qqweb.qq.com' | 'qun.qq.com' | 'qzone.qq.com' | 'ti.qq.com' | 'v.qq.com' | 'vip.qq.com' | 'y.qq.com' | ''
