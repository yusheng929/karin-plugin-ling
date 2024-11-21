import { Config, Render } from '../components/index.js';
import { logger, karin } from 'node-karin';
import { si } from '../models/State/utils.js';
import { getData, getMonitorData } from '../models/State/index.js';
let interval = false;
export const State = karin.command(/^#(铃)?(状态|status)(pro)?(debug)?$/i, async (e) => {
    if (!/铃/.test(e.msg) && !Config.state.default)
        return false;
    if (!si) {
        e.reply('没有检测到systeminformation依赖，请运行："pnpm add systeminformation -w"进行安装');
        return false;
    }
    // 防止多次触发
    if (interval) {
        return false;
    }
    else
        interval = true;
    try {
        // 获取数据
        const data = await getData(e);
        // 渲染图片
        const img = await Render.render('state/index', {
            ...data,
            scale: 1.4
        });
        await e.reply(img);
    }
    catch (error) {
        logger.error(error);
        interval = false;
    }
    interval = false;
    return true;
}, { name: '铃状态', priority: -1 });
export const Monitor = karin.command(/^#?(监控|monitor)$/i, async (e) => {
    const data = await getMonitorData();
    const params = {
        ...data,
        scale: 1.4,
        copyright: 'Karin'
    };
    const img = await Render.render('state/monitor', params);
    e.reply(img);
    return true;
}, { name: '监控', priority: -1 });
