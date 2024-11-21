/**
 *  获取硬盘
 */
export declare function getFsSize(): Promise<false | any[]>;
/**
 * 获取磁盘读写速度
 * @returns {object | boolean} 返回一个对象，包含读速度（rx_sec）和写速度（wx_sec），如果无法获取则返回false。
 */
export declare function getDiskSpeed(): false | {
    rx_sec: string;
    wx_sec: string;
};
