declare const _default: {
    编辑黑白名单: (e: {
        reply: (arg0: string, arg1: {
            at: boolean;
        } | undefined) => void;
    }, type: string, isRemoval: any, targetType: string, id: any) => Promise<boolean>;
    编辑文件: (e: {
        reply: (arg0: string) => void;
    }, 文件: any, 修改的值: string | number | boolean | object | any[], 配置项: string, 修改内容: any) => Promise<boolean>;
};
export default _default;
