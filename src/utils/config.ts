import path from 'node:path'
import { dirPath } from '@/utils/dir'
import Yaml from 'node-karin/yaml'
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
import type { Cof, Other, Group, Friend, AutoQuitGroup } from '@/types/config'

/** 文件名称枚举 */
export const enum KV {
  Cof = 'cof',
  Other = 'other',
  Group = 'group',
  Friend = 'friend',
  AutoQuitGroup = 'AutoQuitGroup',
}

interface Cache {
  [KV.Cof]: Cof | undefined
  [KV.Other]: Other | undefined
  [KV.Group]: Group | undefined
  [KV.Friend]: Friend | undefined
  [KV.AutoQuitGroup]: AutoQuitGroup | undefined
}

const cacheList: Cache = {
  [KV.Cof]: undefined,
  [KV.Other]: undefined,
  [KV.Group]: undefined,
  [KV.Friend]: undefined,
  [KV.AutoQuitGroup]: undefined,
}

/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${dirPath}/package.json`)

/** 用户配置的插件名称 */
const pluginName = pkg().name.replace(/\//g, '-')
/** 用户配置 */
const dirConfig = `${karinPathBase}/${pluginName}/config`
/** 默认配置 */
const defConfig = `${dirPath}/config/default_config`

/**
 * @description 初始化配置文件
 */
copyConfigSync(defConfig, dirConfig, ['.yaml'])

/**
 * @description 监听配置文件
 */
const list = filesByExt(dirConfig, '.yaml', 'abs')
list.forEach(file => watch(file, (old, now) => {
  const name = path.basename(file, '.yaml') as `${KV}`
  const cache = cacheList[name]
  if (cache) cacheList[name] = undefined
}))

/**
 * @description 续火配置
 */
export const cof = (): Cof => {
  const name = KV.Cof
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Cof>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Cof>(`${defConfig}/${name}.yaml`)
  const result: Cof = { ...def, ...user }
  cacheList[name] = result
  return result
}

/**
 * @description 好友配置
 */
export const friend = (): Friend => {
  const name = KV.Friend
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Friend>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Friend>(`${defConfig}/${name}.yaml`)
  const result: Friend = {
    notify: { ...def.notify, ...user.notify },
    enable: user.enable || def.enable,
    closeLike: user.closeLike || def.closeLike,
    likeStart: user.likeStart || def.likeStart,
    likeEnd: user.likeEnd || def.likeEnd,
  }
  cacheList[name] = result
  return result
}

/**
 * @description 群配置
 */
export const group = (): Group => {
  const name = KV.Group
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Group>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Group>(`${defConfig}/${name}.yaml`)
  const result: Group = {
    accept: { ...def.accept, ...user.accept },
    notify: { ...def.notify, ...user.notify },
    invite: user.invite || def.invite,
    apply_list: user.apply_list || def.apply_list,
    joinGroup: user.joinGroup || def.joinGroup
  }
  result.accept.enable_list = result.accept.enable_list.map(v => String(v))
  result.accept.disable_list = result.accept.disable_list.map(v => String(v))
  result.apply_list = result.apply_list.map(v => String(v))
  result.joinGroup = result.joinGroup.map(v => String(v))
  cacheList[name] = result
  return result
}

/**
 * @description 其他配置
 */
export const other = (): Other => {
  const name = KV.Other
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Other>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Other>(`${defConfig}/${name}.yaml`)
  const result: Other = {
    noWork: user.noWork || def.noWork,
    whoat: user.whoat || def.whoat,
    word_render: user.word_render || def.word_render,
    msg_prefix: user.msg_prefix || def.msg_prefix,
    msg_suffix: user.msg_suffix || def.msg_suffix,
    contactMaster: { ...def.contactMaster, ...user.contactMaster },
  }
  result.noWork = result.noWork.map(v => String(v))
  result.contactMaster.cd = Number(result.contactMaster.cd)
  cacheList[name] = result
  return result
}

/**
 * @description 自动退群配置
 */
export const autoQuitGroup = (): AutoQuitGroup => {
  const name = KV.AutoQuitGroup
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<AutoQuitGroup>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<AutoQuitGroup>(`${defConfig}/${name}.yaml`)
  const result: AutoQuitGroup = {
    enable: user.enable || def.enable,
    autoquit: {
      ...user.autoquit, ...def.autoquit,
    }
  }
  for (const key in result.autoquit) {
    const entry = result.autoquit[key]
    entry.disable_list = entry.disable_list.map(String)
    entry.enable_list = entry.enable_list.map(String)
  }
  cacheList[name] = result
  return result
}

/**
 * @description 修改配置
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值
 * @returns 布尔值
 */
export const setYaml = async (name: string, key: string, value: boolean | string | number) => {
  const file = path.join(dirConfig, `${name}.yaml`)
  if (!existsSync(file)) {
    logger.error(`${file} 不存在`)
    return false
  }
  const datas = fs.readFileSync(file, 'utf8')
  const data = Yaml.parse(datas)
  const keys = key.split('.')
  let a = data
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      a[key] = value
    } else {
      a = a[key]
    }
  })
  fs.writeFileSync(file, Yaml.stringify(data), 'utf8')
  return true
}

/**
 * @description 添加值
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值
 * @returns 布尔值，操作成功返回 true，否则返回 false
 */
export const addYaml = (name: string, key: string, value: string | number) => {
  const file = path.join(dirConfig, `${name}.yaml`)
  if (!existsSync(file)) {
    logger.error(`${file} 不存在`)
    return false
  }
  const datas = fs.readFileSync(file, 'utf8')
  const data = Yaml.parse(datas)
  const keys = key.split('.')
  let a = data

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      if (!Array.isArray(a[key])) {
        a[key] = []
      }
      a[key].push(value)
    } else {
      a = a[key]
    }
  })
  fs.writeFileSync(file, Yaml.stringify(data), 'utf8')
  return true
}

/**
 * @description 删除值
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值，要删除的值
 * @returns 布尔值，操作成功返回 true，否则返回 false
 */
export const delYaml = (name: string, key: string, value: string | number) => {
  const file = path.join(dirConfig, `${name}.yaml`)
  if (!existsSync(file)) {
    logger.error(`${file} 不存在`)
    return false
  }
  const datas = fs.readFileSync(file, 'utf8')
  const data = Yaml.parse(datas)
  const keys = key.split('.')
  let a = data
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      if (Array.isArray(a[key])) {
        const indexToRemove = a[key].indexOf(value)
        if (indexToRemove !== -1) {
          a[key].splice(indexToRemove, 1)
        }
      } else {
        logger.error('删除失败，未找到该配置项')
        return false
      }
    } else {
      a = a[key]
    }
  })
  fs.writeFileSync(file, Yaml.stringify(data), 'utf8')
  return true
}

/**
 * @description 写入 yaml 文件
 * @param name 文件名称
 * @param data 数据
 */
export const writeYaml = (name: string, data: any) => {
  const file = path.join(dirConfig, `${name}.yaml`)
  if (!existsSync(file)) {
    logger.error(`${file} 不存在`)
    return false
  }
  fs.writeFileSync(file, Yaml.stringify(data), 'utf8')
  return true
}
