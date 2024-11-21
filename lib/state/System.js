import os from 'os';
/**
 * 先写个简单示例以后再优化
 */
const System = () => {
    const platform = os.platform();
    const release = os.release();
    const architecture = os.arch();
    return `${platform} ${release} ${architecture}`;
};
export default {
    System
};
