import YAML from 'yaml';
/**
 * YamlReader类提供了对YAML文件的动态读写功能
 */
export default class YamlReader {
    filePath: string;
    document: YAML.Document.Parsed<YAML.Alias.Parsed, true> | YAML.Document.Parsed<YAML.Scalar.Parsed, true> | YAML.Document.Parsed<YAML.YAMLMap.Parsed<YAML.ParsedNode, YAML.ParsedNode | null>, true> | YAML.Document.Parsed<YAML.YAMLSeq.Parsed<YAML.ParsedNode>, true>;
    /**
       * 创建一个YamlReader实例。
       * @param {string} filePath - 文件路径
       */
    constructor(filePath: string);
    /**
       * 解析YAML文件并返回Document对象，保留注释。
       * @returns {Document} 包含YAML数据和注释的Document对象
       */
    parseDocument(): YAML.Document.Parsed<YAML.Alias.Parsed, true> | YAML.Document.Parsed<YAML.Scalar.Parsed, true> | YAML.Document.Parsed<YAML.YAMLMap.Parsed<YAML.ParsedNode, YAML.ParsedNode | null>, true> | YAML.Document.Parsed<YAML.YAMLSeq.Parsed<YAML.ParsedNode>, true>;
    /**
     * 修改指定参数的值。
     * @param {string} key - 参数键名
     * @param {any} value - 新的参数值
     */
    set(key: string, value: any): void;
    /**
     * 从YAML文件中删除指定参数。
     * @param {string} key - 要删除的参数键名
     */
    rm(key: any): void;
    get(keyPath: any): any;
    addIn(keyPath: string, value: any): void;
    get jsonData(): any;
    /**
       * 将更新后的Document对象写入YAML文件中。
       */
    write(): void;
}
