import { MakeDirectoryOptions, PathLike, StatOptions } from 'fs';
export default class Ling {
    static move(Path: string, arg1: string): void;
    constructor();
    /**
   * 检测指定路径是否存在文件或文件夹
   * @param path - 文件或文件夹的路径
   * @param opts - 是否获取文件的详细信息(可选)
   */
    fsStat(path: PathLike, opts: (StatOptions & {
        bigint?: false | undefined;
    }) | undefined): Promise<false | import("fs").Stats>;
    move(Path: PathLike, FinalPath: string): Promise<boolean>;
    mkdir(dir: PathLike, opts: (MakeDirectoryOptions & {
        recursive: true;
    }) | undefined): Promise<boolean>;
    rm(path: PathLike): Promise<boolean>;
}
