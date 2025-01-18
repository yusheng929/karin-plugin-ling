/** 默认布局 */
export declare const defaultLayout: string;
/** 默认参数 */
export declare const copyright: string;
/**
 * 缩放
 * @param pct 缩放比例
 * @returns 缩放样式
 */
export declare const scale: (pct?: number) => string;
/**
 * 渲染
 * @param name 文件名称 不包含`.html`
 * @param params 渲染参数
 */
export declare const render: (name: string, params: Record<string, any>) => Promise<import("node-karin").ImageElement>;
