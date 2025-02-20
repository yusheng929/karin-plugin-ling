export declare const helpTheme: {
    getThemeCfg(): {
        main: string;
        bg: string;
        style: {
            fontColor: string;
            fontShadow: string;
            descColor: string;
            contBgColor: string;
            contBgBlur: number;
            headerBgColor: string;
            rowBgColor1: string;
            rowBgColor2: string;
        };
    };
    getThemeData(diyStyle: {
        [x: string]: any;
        bgBlur: boolean;
    }): Promise<{
        style: string;
        colCount: number;
    }>;
};
