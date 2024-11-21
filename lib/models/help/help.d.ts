export declare const helpCfg: {
    themeSet: boolean;
    title: string;
    subTitle: string;
    colCount: number;
    colWidth: number;
    theme: string;
    bgBlur: boolean;
};
export declare const helpList: ({
    group: string;
    list: {
        icon: number;
        title: string;
        desc: string;
    }[];
    auth?: undefined;
} | {
    group: string;
    auth: string;
    list: {
        icon: number;
        title: string;
        desc: string;
    }[];
})[];
