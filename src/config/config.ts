import { dir } from '@/utils/dir'
import { existsSync, logger, watch } from 'node-karin'
import fs from 'node:fs/promises'
import path from 'node:path'
import { DefCfgTypes } from './types'
import _ from 'node-karin/lodash'

const defCfg: DefCfgTypes = {
  group: {
    MemberChange: {
      notice: {
        enable: false,
        disable_list: [
          '454991766',
          '967068507'
        ],
        joinText: '欢迎加入本群୯(⁠*⁠´⁠ω⁠`⁠*⁠)୬',
        quitText: '用户『{{Id}}』丢下我们一个人走了'
      },
      joinVerify: []
    },
    Invite: {
      notify: {
        enable: false,
        allow: false
      },
      autoInvite: false
    },
    Apply_list: [],
    AutoQuitGroup: {
      enable: false,
      enableText: '当前群不在白名单,已自动退出',
      disableText: '当前群在黑名单,已自动退出',
      autoQuit: {
        default: {
          enable: true,
          disable_list: [],
          enable_list: []
        },
        114514: {
          enable: false,
          disable_list: [],
          enable_list: []
        }
      }
    },
    Perm: {
      notOwnerText: '少女不是群主,不能执行这项操作~',
      notAdminText: '少女不是管理员,不能执行这项操作~',
      higherUserText: '这个人权限比我高,少女做不到~'
    }
  },
  friend: {
    Apply: {
      autoAgree: false,
      notify: {
        enable: true,
        allow: false
      }
    },
    closeLike: false,
    likeStart: '已为你点赞{{likeCount}}次',
    likeEnd: '已经给你赞过了'
  },
  other: {
    noWork: [],
    word_render: true,
    whoat: false,
    autoUpdate: false
  }
}
const merge = (defObj: any, userObj: any) => _.mergeWith({}, defObj, userObj, (dst, src) => {
  if (Array.isArray(dst)) return _.cloneDeep(src)
})

type IsArray<T> = T extends any[] ? true : false

type PathInternal<T, Prev extends string = ''> =
  T extends object ? {
    [K in keyof T & string]: IsArray<T[K]> extends true ? `${Prev}${K}` : `${Prev}${K}` | PathInternal<T[K], `${Prev}${K}.`>
  }[keyof T & string] : never

type PathOf<T> = PathInternal<T>

type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}` ? K extends keyof T ? PathValue<T[K], Rest> : never : P extends keyof T ? T[P] : never

type ArrayPathOf<T> = {
  [P in PathOf<T>]: PathValue<T, P> extends any[] ? P : never
}[PathOf<T>]

type CfgKey = keyof typeof defCfg
class Config {
  #isinit = false
  /** 配置文件路径 */
  readonly CfgPath = dir.ConfigDir
  private readonly CfgKeys: CfgKey[] = Object.keys(defCfg) as CfgKey[]
  private watchTimers = new Map<string, NodeJS.Timeout>()

  CfgCache = new Map<CfgKey, DefCfgTypes[CfgKey]>()

  async init () {
    if (this.#isinit) return
    await fs.mkdir(this.CfgPath, { recursive: true })
    for (const i of this.CfgKeys) {
      const file = path.join(this.CfgPath, `${i}.json`)
      if (!existsSync(file)) { await fs.writeFile(file, JSON.stringify(defCfg[i], null, 2), 'utf8') }
    }
    const list = this.CfgKeys.map(k => path.join(this.CfgPath, `${k}.json`))
    list.forEach(file => watch(file, () => {
      const p = this.watchTimers.get(file)
      if (p) clearTimeout(p)
      const timer = setTimeout(() => {
        const name = path.basename(file, '.json') as CfgKey
        this.CfgCache.delete(name)
        this.watchTimers.delete(file)
        logger.info(`配置${name}变化,删除缓存`)
      }, 300)
      this.watchTimers.set(file, timer)
    }))
    this.#isinit = true
  }

  /**
   * 获取配置文件
   * @param name 配置文件名称
   * @param noCache 不使用缓存
   * @returns
   */
  async get<T extends CfgKey> (name: T, noCache: boolean = false): Promise<DefCfgTypes[T]> {
    const cache = this.CfgCache.get(name)
    if (cache && !noCache) return cache as DefCfgTypes[T]
    const file = path.join(this.CfgPath, `${name}.json`)
    let userCfg: any = {}
    if (existsSync(file)) {
      try {
        const raw = await fs.readFile(file, 'utf8')
        userCfg = JSON.parse(raw)
      } catch (e) {
        logger.error(`解析${name}配置失败，将使用默认配置`, e)
      }
    } else {
      logger.error(`${name}配置不存在，将使用默认配置`)
    }
    const m = merge(defCfg[name], userCfg)
    const f = Object.freeze(m)
    this.CfgCache.set(name, f)
    return f
  }

  /**
   * 修改配置文件内容
   * @param name 文件名
   * @param op 操作类型
   * @param key 键名
   * @param value 值
   * @returns
   */
  async set<
    T extends CfgKey,
    P extends PathOf<DefCfgTypes[T]>
  > (name: T, op: 'set', key: P, value: PathValue<DefCfgTypes[T], P>): Promise<boolean>

  async set<
    T extends CfgKey,
    P extends ArrayPathOf<DefCfgTypes[T]>
  > (name: T, op: 'add' | 'del', key: P, value: PathValue<DefCfgTypes[T], P> extends Array<infer U> ? U : never): Promise<boolean>

  async set<
    T extends CfgKey,
    P extends PathOf<DefCfgTypes[T]>
  > (name: T, op: 'add' | 'del' | 'set', key: P, value: any): Promise<boolean> {
    const data = _.cloneDeep(await this.get(name, true))
    const keys = (key as string).split('.')
    const last = keys.pop()!
    let cur: Record<string, any> = data
    for (const k of keys) {
      if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {}
      cur = cur[k]
    }
    const val = cur[last]
    if (op === 'set') cur[last] = value
    if (op === 'add') {
      if (Array.isArray(val)) {
        val.push(value)
      } else {
        cur[last] = val !== undefined ? [val, value] : [value]
      }
    }
    if (op === 'del') {
      if (Array.isArray(val)) {
        cur[last] = val.filter(i => !_.isEqual(i, value))
      } else {
        logger.error('目标非数组,无法删除')
        return false
      }
    }
    return this.save(name, data)
  }

  /**
   * 保存配置文件
   * @param name 配置文件名称
   * @param data 配置数据
   */
  async save<T extends CfgKey> (name: T, data: DefCfgTypes[T]) {
    const file = path.join(this.CfgPath, `${name}.json`)
    try {
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
      this.CfgCache.delete(name)
      return true
    } catch (e) {
      logger.error('保存配置文件错误', e)
      return false
    }
  }
}
const cfg = new Config()
await cfg.init()
export { cfg }
