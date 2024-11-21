export declare let si: any;
export declare let osInfo: any;
export declare let colorthief: any;
/**
 * 异步初始化系统信息依赖
 * 该函数尝试导入'systeminformation'模块，并获取操作系统信息。
 * 如果导入失败，将根据错误类型打印不同警告信息。
 * @returns {Promise<any>} 返回systeminformation模块的实例，如果导入失败则可能返回undefined。
 */
export declare function initDependence(): Promise<any>;
export declare function getImgColor(path: any): Promise<{
    mainColor: string;
    path: any;
}>;
export declare function getImgPalette(path: string): Promise<{
    similarColor1: string;
    similarColor2: string;
    path: string;
}>;
export declare function importColorThief(): Promise<any>;
/**
 * 将字节大小转换成易读的文件大小格式
 * @param {number} size - 要转换的字节大小
 * @param {object} options - 转换选项
 * @param {number} options.decimalPlaces - 小数点保留位数，默认为2
 * @param {boolean} options.showByte - 是否在大小小于1KB时显示字节单位B，默认为true
 * @param {boolean} options.showSuffix - 是否在单位后面显示缩写，默认为true
 * @returns {string} 转换后的文件大小字符串
 */
export declare function getFileSize(size: number | null | undefined, { decimalPlaces, showByte, showSuffix }?: {
    decimalPlaces?: number | undefined;
    showByte?: boolean | undefined;
    showSuffix?: boolean | undefined;
}): string;
/**
 *  圆形进度条渲染
 * @param {number} res 百分比小数
 * @returns {{per:number,color:string}} per - stroke-dashoffset属性 color - 进度条颜色
 */
export declare function Circle(res: number): {
    per: number;
    color: string;
};
export declare function createAbortCont(timeoutMs: number | undefined): Promise<{
    controller: AbortController;
    clearTimeout: () => void;
}>;
