import { join } from 'path';
import { puppeteer } from '../lib/index.js';
import { Version } from '../components/index.js';
import { Cfg } from 'node-karin';
function scale(pct = 1) {
    const scale = Math.min(2, Math.max(0.5, 100 / 100));
    pct = pct * scale;
    return `style=transform:scale(${pct})`;
}
const Render = {
    async render(path, params) {
        path = path.replace(/.html$/, '');
        const data = {
            _res_path: `${Version.pluginPath}/resources/`,
            tplFile: `${Version.pluginPath}/resources/${path}.html`,
            pluResPath: `${Version.pluginPath}/resources/`,
            saveId: path.split('/').pop(),
            imgType: 'jpeg',
            defaultLayout: join(Version.pluginPath, 'resources', 'common', 'layout', 'default.html'),
            sys: {
                scale: scale(params.scale || 1),
                copyright: params.copyright || `Created By <span class="version"> Karin v${Cfg.package.version} </span> & <span class="version"> ${Version.pluginName} v${Version.version} </span>`,
            },
            ...params,
        };
        return await puppeteer.screenshot(path, data);
    },
    async simpleRender(path, params) {
        path = path.replace(/.html$/, '');
        const data = {
            tplFile: `${Version.pluginPath}/resources/${path}.html`,
            pluResPath: `${Version.pluginPath}/resources/`,
            saveId: path.split('/').pop(),
            imgType: 'jpeg',
            ...params,
        };
        return await puppeteer.screenshot(path, data);
    },
};
export default Render;
