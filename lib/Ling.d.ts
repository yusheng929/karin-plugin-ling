import { MakeDirectoryOptions, PathLike, StatOptions } from 'fs';
declare class Ling {
    constructor();
    /**
     * 检测指定路径是否存在文件或文件夹
     * @param path - 文件或文件夹的路径
     * @param opts - 是否获取文件的详细信息(可选)
     */
    fsStat(path: PathLike, opts: (StatOptions & {
        bigint?: false | undefined;
    }) | undefined): Promise<false | import("fs").Stats>;
    /**
     * 移动文件或文件夹
     * @param Path - 源路径
     * @param FinalPath - 目标路径
     */
    move(Path: PathLike, FinalPath: string): Promise<boolean>;
    /**
     * 创建文件夹
     * @param dir - 文件夹路径
     * @param opts - 选项（递归等）
     */
    mkdir(dir: PathLike, opts: (MakeDirectoryOptions & {
        recursive: true;
    }) | undefined): Promise<boolean>;
    /**
     * 删除文件或文件夹
     * @param path - 文件或文件夹路径
     */
    rm(path: PathLike): Promise<boolean>;
    /**
     * 异步执行命令
     * @param cmd - 要执行的命令
     */
    exec(cmd: string): Promise<string>;
}
declare const _default: Ling;
export default _default;
