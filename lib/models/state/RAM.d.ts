declare const _default: {
    getRAMInfo: () => Promise<string>;
    getRAMTotal: () => Promise<string | number>;
    getRAMUsed: () => Promise<string | number>;
    getRAMFree: () => Promise<string | number>;
    getSwap: () => Promise<string>;
    getSwapTotal: () => Promise<string | number>;
    getSwapUsed: () => Promise<string | number>;
    getSwapFree: () => Promise<string | number>;
};
export default _default;
