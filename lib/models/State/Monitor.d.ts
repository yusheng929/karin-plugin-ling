declare const _default: {
    [x: string]: any;
    network: any;
    fsStats: any;
    init(): Promise<void>;
    getData(): Promise<any>;
    getRedisChartData(): Promise<boolean>;
    setRedisChartData(): Promise<void>;
    /**
     * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
     * @param {Array} arr - 要添加数据的数组
     * @param {*} data - 要添加的新数据
     * @param {number} [maxLen] - 数组允许的最大长度，默认值为60
     * @returns {void}
     */
    _addData(arr: any[], data: any[] | null | undefined, maxLen?: number): void;
};
export default _default;
