interface Log {
    title: string;
    logs: string[];
}
interface Temp {
    logs: Log[];
    version: string;
}
declare const _default: {
    version: string | undefined;
    changelogs: Temp[];
    readLogFile: (root: string, versionCount?: number) => {
        changelogs: Temp[];
        currentVersion: string | undefined;
    };
    pluginName: string;
    pluginPath: string;
    BotVersion: any;
};
export default _default;
