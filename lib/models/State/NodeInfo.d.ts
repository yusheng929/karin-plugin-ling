/** 获取nodejs内存情况 */
export default function getNodeInfo(): Promise<false | {
    inner: string;
    title: string;
    info: string[];
    per: number;
    color: string;
}>;
