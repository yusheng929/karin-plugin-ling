export declare function getData(e: any): Promise<{
    BotStatusList: any;
    chartData: string | boolean;
    visualData: unknown[];
    otherInfo: {
        first: string;
        tail: any;
    }[];
    psTest: any;
    fsStats: boolean | {
        rx_sec: string;
        wx_sec: string;
    };
    copyright: string;
    network: boolean | {
        first: any;
        tail: string;
    }[];
    Config: string;
    FastFetch: any;
    HardDisk: any;
    style: any;
    time: string;
    isPro: any;
    chartCfg: string;
}>;
export declare function getMonitorData(): Promise<{
    chartData: string;
    backdrop: string;
    chartCfg: string;
}>;
