/**
 * 获取网络测试列表。
 * @param e
 * @returns {Promise<Array>} 返回一个Promise，该Promise解析为网络测试结果的数组。
 */
export declare function getNetworkTestList(e: any): Promise<({
    first: any;
    tail: string;
} | {
    first: any;
    tail: string;
})[]>;
/** 获取当前网速 */
export declare function getNetwork(): false | {
    first: any;
    tail: string;
}[];
