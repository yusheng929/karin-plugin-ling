import { segment } from 'node-karin';
import { Version } from '../components/index.js';
const puppeteer = await (async () => {
    const m = await import('node-karin');
    const Renderer = m.render || m.Renderer;
    return {
        screenshot: async (path, options) => {
            options.data = { ...options };
            options.name = Version.pluginName + '/' + path;
            options.file = options.tplFile;
            options.type = options.imgType || 'jpeg';
            options.fileID = options.saveId;
            options.screensEval = '#containter';
            const img = await Renderer.render(options);
            return segment.image(img);
        },
    };
})();
export default puppeteer;
