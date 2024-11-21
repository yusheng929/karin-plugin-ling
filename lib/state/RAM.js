import si from 'systeminformation';
const RAMUsage = (used, total) => {
    const usedGiB = (used / (1024 ** 3)).toFixed(2);
    const totalGiB = (total / (1024 ** 3)).toFixed(2);
    const percentage = ((used / total) * 100).toFixed(2);
    return `${usedGiB} GiB / ${totalGiB} GiB (${percentage}%)`;
};
const RAM = async () => {
    try {
        const memoryData = await si.mem();
        const usedRAM = memoryData.active;
        const totalRAM = memoryData.total;
        return RAMUsage(usedRAM, totalRAM);
    }
    catch (error) {
        console.error('获取内存信息失败:', error);
        return '获取内存失败';
    }
};
const SwapRAMUsage = async () => {
    try {
        const swapData = await si.mem();
        const usedSwap = swapData.swapused;
        const totalSwap = swapData.swaptotal;
        if (totalSwap === 0) {
            return 'NaN';
        }
        return RAMUsage(usedSwap, totalSwap);
    }
    catch (error) {
        console.error('获取内存交换信息失败:', error);
        return '内存交换获取失败';
    }
};
export default {
    RAM,
    SwapRAMUsage,
};
