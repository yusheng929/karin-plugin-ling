/**
 * @description 是否跳过处理
 * @param e 消息事件对象
 * @returns 返回`true`跳过处理，返回`false`继续处理
 */
export declare const shouldSkipProcessing: (e: any) => boolean;
/**
 * @description 是否为特权用户
 * @param e 消息事件对象
 * @returns 返回`true`是特权用户，返回`false`不是特权用户
 */
export declare const isPrivilegedUser: (e: any) => boolean;
/**
 * @description 检查违规
 * @param words 违规词列表
 * @param rule 匹配规则
 * @param msg 消息内容
 * @returns 返回`true`违规，返回`false`不违规
 */
export declare const checkViolation: (words: string[], rule: number, msg: string) => boolean;
/**
 * @description 处理违规
 * @param e 消息事件对象
 * @returns 返回`true`退出处理，返回`false`继续处理
 */
export declare const handleViolation: (e: any) => Promise<boolean>;
