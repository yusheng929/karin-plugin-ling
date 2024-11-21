/** 获取CPU占用 */
export default function getCpuInfo(): Promise<false | {
    inner: string;
    title: string;
    info: string[];
    per: number;
    color: string;
}>;
