import path from 'node:path';
import { dirPath } from '../utils/dir.js';
import { watch, basePath, filesByExt, copyConfigSync, requireFileSync, existsSync, yaml, logger, } from 'node-karin';
const cacheList = {
    ["group" /* KV.Group */]: undefined,
    ["cof" /* KV.Cof */]: undefined,
    ["other" /* KV.Other */]: undefined,
    ["state" /* KV.State */]: undefined,
};
/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${dirPath}/package.json`);
/** 用户配置的插件名称 */
const pluginName = pkg().name.replace(/\//g, '-');
/** 用户配置 */
const dirConfig = `${basePath}/${pluginName}/config`;
/** 默认配置 */
const defConfig = `${dirPath}/config/config`;
/**
 * @description 初始化配置文件
 */
copyConfigSync(defConfig, dirConfig, ['.yaml']);
/**
 * @description 群违禁词配置
 */
export const group = () => {
    const name = "group" /* KV.Group */;
    const cache = cacheList[name];
    if (cache)
        return cache;
    const user = requireFileSync(`${dirConfig}/${name}.yaml`);
    const def = requireFileSync(`${defConfig}/${name}.yaml`);
    const result = { default: { ...def.default, ...user.default } };
    Object.keys(user).forEach(key => {
        if (key === 'default')
            return;
        result[key] = { ...result.default, ...user[key] };
    });
    cacheList[name] = result;
    return result;
};
/**
 * @description 续火配置
 */
export const cof = () => {
    const name = "cof" /* KV.Cof */;
    const cache = cacheList[name];
    if (cache)
        return cache;
    const user = requireFileSync(`${dirConfig}/${name}.yaml`);
    const def = requireFileSync(`${defConfig}/${name}.yaml`);
    const result = { ...def, ...user };
    cacheList[name] = result;
    return result;
};
/**
 * @description 其他配置
 */
export const other = () => {
    const name = "other" /* KV.Other */;
    const cache = cacheList[name];
    if (cache)
        return cache;
    const user = requireFileSync(`${dirConfig}/${name}.yaml`);
    const def = requireFileSync(`${defConfig}/${name}.yaml`);
    const result = {
        accept: { ...def.accept, ...user.accept },
        joinGroup: user.joinGroup || def.joinGroup || [],
        friend: { ...def.friend, ...user.friend },
        noWork: user.noWork || def.noWork || [],
        group: {
            ...def.group,
            ...user.group,
            alone: user.group?.alone || def.group.alone || [],
        },
    };
    result.accept.blackGroup = result.accept.blackGroup.map(v => String(v));
    result.group.list = result.group.list.map(v => String(v));
    result.joinGroup = result.joinGroup.map(v => String(v));
    result.noWork = result.noWork.map(v => String(v));
    cacheList[name] = result;
    return result;
};
/**
 * @description 状态配置
 */
export const state = () => {
    const name = "state" /* KV.State */;
    const cache = cacheList[name];
    if (cache)
        return cache;
    const user = requireFileSync(`${dirConfig}/${name}.yaml`);
    const def = requireFileSync(`${defConfig}/${name}.yaml`);
    const result = { ...def, ...user };
    cacheList[name] = result;
    return result;
};
/**
 * @description 修改配置
 * @param name 文件名称
 * @param data 配置数据
 */
export const setYaml = (name, data) => {
    const file = path.join(dirConfig, `${name}.yaml`);
    const comment = path.join(dirConfig, '../', 'comment', `${name}.json`);
    if (!existsSync(file)) {
        logger.error(`${file} 不存在`);
        return false;
    }
    yaml.save(file, data, existsSync(comment) ? comment : undefined);
    return true;
};
/**
 * @description 监听配置文件
 */
setTimeout(() => {
    const list = filesByExt(dirConfig, '.yaml', 'abs');
    list.forEach(file => watch(file, (old, now) => {
        const name = file.split('/').pop();
        const cache = cacheList[name];
        if (cache)
            cacheList[name] = undefined;
    }));
}, 2000);
