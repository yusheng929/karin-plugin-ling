declare class Config {
    /** 配置文件跟路径 */
    dir: string;
    /** 默认配置文件根路径 */
    defdir: string;
    /** 缓存 不经常用的不建议缓存 */
    change: Map<string, any>;
    /** 监听文件 */
    watcher: Map<string, any>;
    constructor();
    /** 初始化配置 */
    initCfg(): Promise<void>;
    /**
   * 更新yaml文件
   * @param filePath - 文件路径
   * @param settings - 设置项
   */
    updateYaml(filePath: string, settings: {
        /** 键路径 */
        key: string;
        /** 要写入的 */
        val: any;
        /** 需要写入的注释 */
        comment: string;
        /** 是否添加到顶部 否则添加到同一行 */
        type: boolean;
    }[]): void;
    /**
     * 基本配置
     */
    get Config(): {
        /** 实例配置1 */
        keya: string;
        /** 实例配置2 */
        Keyb: {
            a: string;
        };
    };
    /**
     * packageon
     * 这里建议采用实时读取 不建议缓存
     */
    get package(): any;
    /**
     * 获取配置yaml
     */
    getYaml(type: 'defSet' | 'config', name: string, isWatch?: boolean): any;
    /**
     * 监听配置文件
     * @param {'defSet'|'config'} type 类型
     * @param {string} name 文件名称 不带后缀
     * @param {string} file 文件路径
     */
    watch(type: 'defSet' | 'config', name: string, file: string): Promise<true | undefined>;
}
/**
 * 配置文件
 */
declare const _default: Config;
export default _default;
