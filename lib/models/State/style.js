import { Config, Version } from '../../components/index.js';
import { createAbortCont } from './utils.js';
import fs from 'fs';
import _ from 'lodash';
import { logger } from 'node-karin';
export default async function getStyle() {
    return {
        backdrop: await getBackground()
    };
}
export async function getBackground() {
    const { backdrop, backdropDefault } = Config.state;
    const { controller, clearTimeout } = await createAbortCont(5000);
    try {
        if (!backdrop)
            throw Error('配置项backdrop为假');
        const startTime = Date.now();
        // const buffer = await requset.get(backdrop, {
        //   statusCode: 'arrayBuffer',
        //   signal: controller.signal,
        //   outErrorLog: false
        // })
        const buffer = await fetch(backdrop, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'
            }
        }).then(res => res.arrayBuffer());
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const fileSizeInBytes = buffer.byteLength;
        const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
        logger.info(`[${Version.pluginName}][状态]背景图片请求成功 ${fileSizeInKB}KB ${elapsedTime}ms`);
        const buffBase64 = arrayBufferToBase64(buffer);
        return `data:image/jpeg;base64,${buffBase64}`;
    }
    catch (err) {
        const bg = getDefaultBackdrop(backdropDefault);
        backdrop && logger.warn(`[${Version.pluginName}][状态]背景图请求失败，使用默认背景图 “${bg}” ，错误原因: ${err.message}`);
        return bg;
    }
    finally {
        clearTimeout();
    }
}
function arrayBufferToBase64(arrayBuffer) {
    return Buffer.from(arrayBuffer).toString('base64');
}
function getDefaultBackdrop(backdropDefault) {
    const Bg_Path = Version.pluginPath + '/resources/state/img/bg';
    if (backdropDefault === 'random') {
        backdropDefault = _.sample(fs.readdirSync(Bg_Path));
        logger.debug(`[${Version.pluginName}][状态]使用随机背景图 “${backdropDefault}”`);
    }
    return `${Version.pluginPath}/resources/state/img/bg/${backdropDefault}`;
}
