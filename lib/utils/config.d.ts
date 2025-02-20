import type { Cof, Gorup, Other } from '../types/config.js';
/** 文件名称枚举 */
export declare const enum KV {
    Group = "group",
    Cof = "cof",
    Other = "other"
}
/**
 * @description package.json
 */
export declare const pkg: () => any;
/**
 * @description 群违禁词配置
 */
export declare const group: () => Gorup;
/**
 * @description 续火配置
 */
export declare const cof: () => Cof;
/**
 * @description 其他配置
 */
export declare const other: () => Other;
/**
 * @description 修改配置
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值
 * @returns 布尔值
 */
export declare const setYaml: (name: string, key: string, value: boolean | string | number) => Promise<boolean>;
/**
 * @description 添加值
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值
 * @returns 布尔值，操作成功返回 true，否则返回 false
 */
export declare const addYaml: (name: string, key: string, value: string | number) => boolean;
/**
 * @description 删除值
 * @param name 文件名称
 * @param key 配置键
 * @param value 配置值，要删除的值
 * @returns 布尔值，操作成功返回 true，否则返回 false
 */
export declare const delYaml: (name: string, key: string, value: string | number) => boolean;
