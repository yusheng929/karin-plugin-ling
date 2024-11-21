/** 获取当前内存占用 */
export default function getMemUsage(): Promise<{
    inner: string;
    title: string;
    info: string[];
    buffcache: {
        color: string;
        isBuff: any;
        per: number;
    };
    per: number;
    color: string;
}>;
