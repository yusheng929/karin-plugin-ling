import path from 'node:path'
import fs from 'node:fs'
import {
  watch,
  karinPathBase,
  filesByExt,
  copyConfigSync,
  requireFileSync,
  existsSync,
  logger,
} from 'node-karin'
import type { Other, Group, Friend } from '@/config/types'
import _ from 'node-karin/lodash'
import { Oldcfg } from '@/config/oldtypes'
import { Root } from '@/utils/dir'

/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${Root.pluginPath}/package.json`)
class Cfg {
  Cache: Record<string, any> = {}
  dirConfig: string
  defConfig: string
  constructor () {
    this.dirConfig = `${karinPathBase}/${Root.pluginName}/config`
    this.defConfig = `${Root.pluginPath}/config/`
    this.init()
  }

  async init () {
    copyConfigSync(this.defConfig, this.dirConfig, ['.json'])
    try {
      const files = await fs.promises.readdir(this.dirConfig)
      const yamlFiles = files.filter(v => v.endsWith('.yaml'))
      if (yamlFiles.length > 0) {
        logger.info('开始迁移旧配置文件,可能花费较长时间')
        const Cfg: Oldcfg = {} as any
        for (const file of yamlFiles) {
          const filePath = path.join(this.dirConfig, file)
          const data = requireFileSync(filePath);
          (Cfg as Record<string, any>)[path.parse(file).name] = data
          fs.promises.unlink(filePath)
        }
        for (const i of ['group', 'friend', 'other']) {
          let cfg = null
          switch (i) {
            case 'group':
              cfg = {
                MemberChange: {
                  notice: {
                    enable: Cfg.group.accept.enable,
                    disable_list: Cfg.group.accept.disable_list,
                    joinText: Cfg.group.accept.jointext,
                    quitText: Cfg.group.accept.quittext
                  },
                  joinVerify: Cfg.group.joinGroup
                },
                Invite: {
                  notify: {
                    enable: Cfg.group.notify.group_enable,
                    allow: Cfg.group.notify.allow
                  },
                  autoInvite: Cfg.group.invite
                },
                Apply_list: Cfg.group.apply_list,
                AutoQuitGroup: {
                  enable: Cfg.AutoQuitGroup.enable,
                  enableText: Cfg.AutoQuitGroup.enabletext,
                  disableText: Cfg.AutoQuitGroup.disabletext,
                  autoQuit: Cfg.AutoQuitGroup.autoquit
                }
              }
              break
            case 'friend':
              cfg = {
                Apply: {
                  autoAgree: Cfg.friend.enable,
                  notify: {
                    enable: Cfg.friend.notify.enable,
                    allow: Cfg.friend.notify.allow
                  }
                },
                closeLike: Cfg.friend.closeLike,
                likeStart: Cfg.friend.likeStart,
                likeEnd: Cfg.friend.likeEnd
              }
              break
            case 'other':
              cfg = {
                noWork: Cfg.other.noWork,
                word_render: Cfg.other.word_render,
                whoat: Cfg.other.whoat
              }
          }
          await this.saveJson(i, cfg!)
        }
        logger.info('配置文件迁移完成')
      }
    } catch (err) {
      return logger.error('配置文件迁移失败', err)
    }
    const list = filesByExt(this.dirConfig, '.json', 'abs')
    list.forEach(file => watch(file, (old, now) => {
      const name = path.basename(file, '.json')
      const cache = this.Cache[name]
      if (cache) this.Cache[name] = undefined
    }))
  }

  /**
   * 获取群配置
   */
  async getGroup (): Promise<Group> {
    if (this.Cache['group']) return this.Cache['group']
    const data = await this.getJson('group')
    this.Cache['group'] = data
    return data
  }

  /** 获取好友配置 */
  async getFriend (): Promise<Friend> {
    if (this.Cache['friend']) return this.Cache['friend']
    const data = await this.getJson('friend')
    this.Cache['friend'] = data
    return data
  }

  /** 获取其他配置 */
  async getOther (): Promise<Other> {
    if (this.Cache['other']) return this.Cache['other']
    const data = await this.getJson('other')
    this.Cache['other'] = data
    return data
  }

  /**
   * 获取JSON配置文件
   * @param name 配置文件名称
   */
  async getJson (name: string) {
    let file = path.join(this.dirConfig, `${name}.json`)
    if (!existsSync(file)) {
      logger.error('配置文件获取错误, 将使用默认配置')
      file = path.join(this.defConfig, `${name}.json`)
    }
    return JSON.parse(await fs.promises.readFile(file, 'utf8'))
  }

  /**
   * 修改指定键的值
   * @param name 文件名
   * @param operation 操作类型
   * @param key 键
   * @param value 值
   */
  async setJson (name: string, operation: 'set' | 'add' | 'del', key: string, value: string) {
    const data = await this.getJson(name)
    switch (operation) {
      case 'set':
        _.set(data, key, value)
        break
      case 'add':
        _.get(data, key).push(value)
        break
      case 'del':
        _.pull(_.get(data, key), value)
        break
    }
    await this.saveJson(name, data)
  }

  /**
   * 保存 JSON 配置文件
   * @param name 配置文件名称
   * @param data 配置数据
   */
  async saveJson (name: string, data: object) {
    const file = path.join(this.dirConfig, `${name}.json`)
    if (!existsSync(file)) {
      logger.error(`配置文件保存错误, ${file} 不存在`)
      return false
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
    return true
  }
}
export const cfg = new Cfg()
