import path from 'node:path'
import { dirPath } from '@/utils/dir'
import Yaml from 'node-karin/yaml'
import fs from 'node:fs'
import {
  watch,
  basePath,
  filesByExt,
  copyConfigSync,
  requireFileSync,
  existsSync,
  logger,
} from 'node-karin'
import type { Cof, Gorup, Other } from '@/types/config'

/** 文件名称枚举 */
export const enum KV {
  Group = 'group',
  Cof = 'cof',
  Other = 'other',
}

interface Cache {
  [KV.Group]: Gorup | undefined
  [KV.Cof]: Cof | undefined
  [KV.Other]: Other | undefined
}

const cacheList: Cache = {
  [KV.Group]: undefined,
  [KV.Cof]: undefined,
  [KV.Other]: undefined,
}

/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${dirPath}/package.json`)

/** 用户配置的插件名称 */
const pluginName = pkg().name.replace(/\//g, '-')
/** 用户配置 */
const dirConfig = `${basePath}/${pluginName}/config`
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
 * @description 群违禁词配置
 */
export const group = (): Gorup => {
  const name = KV.Group
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Gorup>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Gorup>(`${defConfig}/${name}.yaml`)
  const result: Gorup = { default: { ...def.default, ...user.default } }
  Object.keys(user).forEach(key => {
    if (key === 'default') return
    result[key] = { ...result.default, ...user[key] }
  })

  cacheList[name] = result
  return result
}

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
 * @description 其他配置
 */
export const other = (): Other => {
  const name = KV.Other
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Other>(`${dirConfig}/${name}.yaml`)
  const def = requireFileSync<Other>(`${defConfig}/${name}.yaml`)
  const result: Other = {
    accept: { ...def.accept, ...user.accept },
    joinGroup: user.joinGroup || def.joinGroup || [],
    notify: user.notify || def.notify,
    friend: { ...def.friend, ...user.friend },
    noWork: user.noWork || def.noWork || [],
    group: {
      ...def.group,
      ...user.group,
    },
    word_render: user.word_render || def.word_render,
  }

  result.accept.enable_list = result.accept.enable_list.map(v => String(v))
  result.accept.disable_list = result.accept.disable_list.map(v => String(v))
  result.group.list = result.group.list.map(v => String(v))
  result.joinGroup = result.joinGroup.map(v => String(v))
  result.noWork = result.noWork.map(v => String(v))
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
