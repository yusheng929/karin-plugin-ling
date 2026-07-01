import { logger } from 'node-karin'
import { writeFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import Path from 'node:path'
import * as DefCfg from './defconfig'
import { dir } from '@/utils/dir'
import chokidar, { FSWatcher } from 'chokidar'

/** 定义类型 */
type Primitive = string | number | boolean | bigint | symbol | null | undefined

/** 获取对象键 */
type DeepKey<T> = { [K in keyof T]: T[K] extends Primitive | any[] ? `${Extract<K, string>}` : `${Extract<K, string>}` | `${Extract<K, string>}.${DeepKey<T[K]>}` }[keyof T]

/** 获取数组键 */
type ArrayKey<T> = { [K in keyof T]: T[K] extends any[] ? `${Extract<K, string>}` : T[K] extends object ? `${Extract<K, string>}.${ArrayKey<T[K]>}` : never }[keyof T]

/** 键名反查键值类型 */
type PathValue<T, P extends string> = P extends `${infer K}.${infer R}` ? K extends keyof T ? PathValue<T[K], R> : never : P extends keyof T ? T[P] : never

// --- 工具函数：深度克隆与深度合并 ---
function isObject (item: unknown): item is Record<string, any> {
  return !!item && typeof item === 'object' && !Array.isArray(item)
}

function deepClone<T> (obj: T): T {
  return structuredClone(obj)
}

function deepMerge<T> (defaultObj: any, fileObj: any): T {
  const output = { ...defaultObj }
  if (isObject(defaultObj) && isObject(fileObj)) {
    Object.keys(fileObj).forEach((key) => {
      if (isObject(fileObj[key]) && key in defaultObj) {
        output[key] = deepMerge(defaultObj[key], fileObj[key])
      } else {
        output[key] = fileObj[key]
      }
    })
  }
  return output as T
}
// ------------------------------------

type ConfigMap = typeof DefCfg
export class ConfigManager {
  private configDir = dir.ConfigDir
  private defaults = DefCfg
  private cache: Map<keyof ConfigMap, any> = new Map()
  private watcher: null | FSWatcher = null

  public async init (): Promise<void> {
    await mkdir(this.configDir, { recursive: true })

    for (const key of Object.keys(this.defaults) as (keyof ConfigMap)[]) {
      const filePath = Path.join(this.configDir, `${String(key)}.json`)
      if (!existsSync(filePath)) {
        await this.save(key, this.defaults[key])
      }
    }
  }

  /**
   * 获取配置
   * @param fileName 文件名
   * @returns 配置
   */
  public get<T extends keyof ConfigMap> (fileName: T): ConfigMap[T] {
    let configData = this.cache.get(fileName)

    if (!configData) {
      try {
        const filePath = Path.join(this.configDir, `${String(fileName)}.json`)
        const fileContent = readFileSync(filePath, 'utf-8')
        const parsedData = JSON.parse(fileContent)
        const defaultData = this.defaults[fileName] || {}
        configData = deepMerge(deepClone(defaultData), parsedData)

        this.cache.set(fileName, configData)
      } catch (error) {
        configData = deepClone(this.defaults[fileName])
        this.cache.set(fileName, configData)
      }
    }
    return configData
  }

  /**
   * 保存配置文件
   * @param fileName 文件名
   * @param data 数据
   */
  public async save<T extends keyof ConfigMap> (fileName: T, data: ConfigMap[T]): Promise<void> {
    const filePath = Path.join(this.configDir, `${String(fileName)}.json`)
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    this.cache.set(fileName, deepClone(data))
  }

  /**
   * 设置键值
   * @param fileName 文件名
   * @param path 键名
   * @param value 值
   */
  public async set<T extends keyof ConfigMap, P extends DeepKey<ConfigMap[T]>> (fileName: T, path: P, value: PathValue<ConfigMap[T], P>): Promise<void> {
    const fullConfig = deepClone(this.get(fileName))
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce<Record<string, any>>((acc, part) => {
      if (acc[part] === undefined) acc[part] = {}
      return acc[part]
    }, fullConfig)
    target[lastKey] = value
    await this.save(fileName, fullConfig)
  }

  /**
   * 新增数组值
   * @param fileName 文件名
   * @param path 键名
   * @param value 值
   */
  public async push<T extends keyof ConfigMap, P extends ArrayKey<ConfigMap[T]>> (fileName: T, path: P, value: any): Promise<void> {
    const fullConfig = deepClone(this.get(fileName))
    const targetArray = path.split('.').reduce((acc, part) => acc && acc[part], fullConfig as any)
    if (!Array.isArray(targetArray)) {
      throw new Error(`路径 ${path} 不是一个数组`)
    }
    targetArray.push(value)
    await this.save(fileName, fullConfig)
  }

  /**
   * 移除数组值
   * @param fileName 文件名
   * @param path 键名
   * @param predicate 值
   */
  public async remove<T extends keyof ConfigMap, P extends DeepKey<ConfigMap[T]>> (
    fileName: T,
    path: P,
    predicate: any | ((item: any) => boolean)
  ): Promise<void> {
    const fullConfig = deepClone(this.get(fileName))
    const targetArray = path.split('.').reduce((acc, part) => acc && acc[part], fullConfig as any)

    if (!Array.isArray(targetArray)) {
      throw new Error(`路径 ${path} 不是一个数组`)
    }

    const index = typeof predicate === 'function'
      ? targetArray.findIndex(predicate)
      : targetArray.indexOf(predicate)

    if (index !== -1) {
      targetArray.splice(index, 1)
      await this.save(fileName, fullConfig)
    }
  }

  private watch (): void {
    const path = Object.keys(this.defaults).map(key => Path.join(this.configDir, `${key}.json`))
    this.watcher = chokidar.watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    })
    this.watcher.on('change', (path) => {
      const name = Path.basename(path, '.json') as keyof ConfigMap
      this.cache.delete(name)
      logger.info(`配置文件 ${name}.json 已更新，缓存已清除。`)
    })
  }
}

export const cfg = new ConfigManager()
