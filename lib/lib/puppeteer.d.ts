declare const puppeteer: {
    screenshot: (path: string, options: {
        data: any;
        name: string;
        file: any;
        tplFile: any;
        type: any;
        imgType: string;
        fileID: any;
        saveId: any;
        screensEval: string;
    }) => Promise<import("node-karin").ImageElement>;
};
export default puppeteer;
