import fs from 'fs';
import { logger } from 'node-karin';
import path from 'path';
import { pathToFileURL } from 'url';
const Restart = await (async () => {
    const baseRestartPath = path.join(process.cwd(), 'plugins/karin-plugin-basic/apps/restart.js');
    if (fs.existsSync(baseRestartPath)) {
        const restartUrl = pathToFileURL(baseRestartPath).href;
        const { Restart } = await import(restartUrl);
        return Restart;
    }
    else {
        logger.error('未安装karin-plugin-basic (https://github.com/KarinJS/karin-plugin-basic)，无法提供重启支持，请安装后重试！');
        return false;
    }
})();
export default Restart;
