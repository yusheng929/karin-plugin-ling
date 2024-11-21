/** 获取GPU占用 */
export default function getGPU(): Promise<false | {
    inner: string;
    title: string;
    info: string[];
    per: number;
    color: string;
}>;
