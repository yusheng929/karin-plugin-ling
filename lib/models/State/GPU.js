import { Circle, si, initDependence } from './utils.js';
import { logger } from 'node-karin';
import { Version } from '../../components/index.js';
let isGPU = false;
(async function initGetIsGPU() {
    if (!await initDependence())
        return;
    const { controllers } = await si.graphics();
    // 初始化GPU获取
    if (controllers?.find((item) => item.memoryUsed && item.memoryFree && item.utilizationGpu)) {
        isGPU = true;
    }
})();
/** 获取GPU占用 */
export default async function getGPU() {
    if (!isGPU)
        return false;
    try {
        const { controllers } = await si.graphics();
        const graphics = controllers?.find((item) => item.memoryUsed && item.memoryFree && item.utilizationGpu);
        if (!graphics) {
            logger.warn(`[${Version.pluginName}][state]状态GPU数据异常：\n`, controllers);
            return false;
        }
        let { vendor, temperatureGpu, utilizationGpu, memoryTotal, memoryUsed /* powerDraw */ } = graphics;
        temperatureGpu && (temperatureGpu = temperatureGpu + '℃');
        // powerDraw && (powerDraw = powerDraw + "W")
        return {
            ...Circle(utilizationGpu / 100),
            inner: Math.round(utilizationGpu) + '%',
            title: 'GPU',
            info: [
                `${(memoryUsed / 1024).toFixed(2)} GB / ${(memoryTotal / 1024).toFixed(2)} GB`,
                `${vendor} ${temperatureGpu}`
            ]
        };
    }
    catch (e) {
        logger.warn(`[${Version.pluginName}][State] 获取GPU失败`);
        return false;
    }
}
