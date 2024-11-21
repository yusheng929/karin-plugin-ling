import karin from 'node-karin';
import lodash from 'lodash';
import fs from 'fs';
import { Render, Version } from '../components/index.js';
import { helpCfg, helpList, helpTheme } from '../models/index.js';
import { markdown } from '@karinjs/md-html';
export const help = karin.command(/^#?(铃|ling)(帮助|菜单|help)$/i, async (e) => {
    const helpGroup = [];
    lodash.forEach(helpList, (group) => {
        if (group.auth && group.auth === 'master' && !e.isMaster) {
            return true;
        }
        helpGroup.push(group);
    });
    const themeData = await helpTheme.getThemeData(helpCfg);
    const img = await Render.render('help/index', {
        helpCfg,
        helpGroup,
        ...themeData,
        scale: 1.2,
    });
    await e.reply(img);
    return true;
}, { name: '帮助', priority: -1 });
export const version = karin.command(/^#?(铃|ling)(版本|version)$/i, async (e) => {
    const changelogs = fs.readFileSync(Version.pluginPath + '/CHANGELOG.md', 'utf8');
    const html = markdown(changelogs, {
        gitcss: 'github-markdown-dark.css',
    });
    fs.writeFileSync(Version.pluginPath + '/resources/help/changelogs.html', html);
    const img = await Render.render('help/changelogs', {
        scale: 1.2,
        copyright: 'karin-plugin-ling',
    });
    await e.reply(img);
    return true;
});
