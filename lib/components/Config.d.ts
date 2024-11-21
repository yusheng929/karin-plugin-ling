interface Config {
    [key: string]: any;
}
declare class Config {
    constructor();
    /** 初始化配置 */
    initCfg(): void;
    /** 其他 */
    get Other(): any;
    get Cof(): any;
    get state(): any;
    get GroupYaml(): any;
    /** 默认配置和用户配置 */
    getDefOrConfig(name: string): any;
    get package(): any;
    /** 默认配置 */
    getdefSet(name: any): any;
    /** 用户配置 */
    getConfig(name: any): any;
    /**
     * 获取配置yaml
     * @param type 默认跑配置-defSet，用户配置-config
     * @param name 名称
     */
    getYaml(type: string | undefined, name: any): any;
    /** 监听配置文件 */
    watch(file: string | readonly string[], name: string, type?: string): void;
    /**
     * 修改设置
     * @param {String} name 文件名
     * @param {String} key 修改的key值
     * @param {String|Number} value 修改的value值
     * @param {'config'|'default_config'} type 配置文件或默认
     */
    modify(name: string, key: string, value: any, type?: string): void;
    mergeObjectsWithPriority(objA: any, objB: any): {
        differences: boolean;
        result: any;
    };
}
declare const _default: Config;
export default _default;
