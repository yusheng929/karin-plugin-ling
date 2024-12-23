import path from 'node:path'
import { dirPath } from '@/utils/dir'
import {
  watch,
  basePath,
  filesByExt,
  copyConfigSync,
  requireFileSync,
  existsSync,
  yaml,
} from 'node-karin'
import type { Cof, Gorup, Other, State } from '@/types/config'

/** 文件名称枚举 */
export const enum KV {
  Group = 'group.yaml',
  Cof = 'cof.yaml',
  Other = 'other.yaml',
  State = 'state.yaml',
}

interface Cache {
  [KV.Group]: Gorup | undefined
  [KV.Cof]: Cof | undefined
  [KV.Other]: Other | undefined
  [KV.State]: State | undefined
}

const cacheList: Cache = {
  [KV.Group]: undefined,
  [KV.Cof]: undefined,
  [KV.Other]: undefined,
  [KV.State]: undefined,
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
const defConfig = `${dirPath}/config/config`

/**
 * @description 初始化配置文件
 */
copyConfigSync(defConfig, dirConfig, ['.yaml'])

/**
 * @description 群违禁词配置
 */
export const group = (): Gorup => {
  const name = KV.Group
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<Gorup>(`${dirConfig}/${name}`)
  const def = requireFileSync<Gorup>(`${defConfig}/${name}`)
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
  const user = requireFileSync<Cof>(`${dirConfig}/${name}`)
  const def = requireFileSync<Cof>(`${defConfig}/${name}`)
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
  const user = requireFileSync<Other>(`${dirConfig}/${name}`)
  const def = requireFileSync<Other>(`${defConfig}/${name}`)
  const result: Other = {
    accept: { ...def.accept, ...user.accept },
    joinGroup: user.joinGroup || def.joinGroup || [],
    friend: { ...def.friend, ...user.friend },
    noWork: user.noWork || def.noWork || [],
    group: {
      ...def.group,
      ...user.group,
      alone: user.group?.alone || def.group.alone || [],
    },
  }

  result.accept.blackGroup = result.accept.blackGroup.map(v => String(v))
  result.joinGroup = result.joinGroup.map(v => String(v))
  result.noWork = result.noWork.map(v => String(v))
  cacheList[name] = result
  return result
}

/**
 * @description 状态配置
 */
export const state = (): State => {
  const name = KV.State
  const cache = cacheList[name]
  if (cache) return cache
  const user = requireFileSync<State>(`${dirConfig}/${name}`)
  const def = requireFileSync<State>(`${defConfig}/${name}`)
  const result: State = { ...def, ...user }
  cacheList[name] = result
  return result
}

/**
 * @description 修改配置
 * @param name 文件名称
 * @param data 配置数据
 */
export const setYaml = (name: `${KV}`, data: unknown) => {
  const file = path.join(dirConfig, `${name}.yaml`)
  const comment = path.join(dirConfig, '../', 'comment', `${name}.json`)
  if (!existsSync(file)) return false
  yaml.save(file, data, existsSync(comment) ? comment : undefined)
  return true
}

/**
 * @description 监听配置文件
 */
setTimeout(() => {
  const list = filesByExt(dirConfig, '.yaml', 'abs')
  list.forEach(file => watch(file, (old, now) => {
    const name = file.split('/').pop() as KV
    const cache = cacheList[name]
    if (cache) cacheList[name] = undefined
  }))
}, 2000)
