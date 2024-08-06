import { karin, segment,common } from 'node-karin';
const Path = common.absPath("./plugins/karin-plugin-group/resources/help", true, false);
export const BCommand = karin.command('^#?群管帮助$', segment.image(Path + '/help.jpg'))