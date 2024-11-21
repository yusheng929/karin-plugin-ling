import { karin } from 'node-karin';
import { Work, ProhibitedWords as Pw } from '../tools/index.js';
export const use = karin.use('recvMsg', async (e, next, exit) => {
    let gg = await Work.Work(e);
    if (gg)
        return exit();
    let gg1 = await Pw.ProhibitedWords(e);
    if (gg1)
        return exit();
    next();
});
