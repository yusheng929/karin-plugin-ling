import type { Cof, Gorup, Other, State } from '../types/config.js';
/** 文件名称枚举 */
export declare const enum KV {
    Group = "group",
    Cof = "cof",
    Other = "other",
    State = "state"
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
 * @description 状态配置
 */
export declare const state: () => State;
/**
 * @description 修改配置
 * @param name 文件名称
 * @param data 配置数据
 */
export declare const setYaml: (name: `${KV}`, data: unknown) => boolean;
