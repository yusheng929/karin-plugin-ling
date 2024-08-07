import { karin, segment, common } from 'node-karin'
export const BCommand = karin.command('^#群管帮助$', segment.image('base64://' + await common.base64('./plugins/karin-plugin-group/resources/help/help.jpg')))
