import { karin, segment, common, Cfg, YamlEditor } from 'node-karin'
import { Config } from '#components'
import fs from 'fs'
import YAML from 'yaml' // 使用 yaml 包代替 js-yaml

// 仅用于开发者测试部分功能实现，无其他作用(请勿使用，后果自负)
export const test = karin.command(/^测试/, async (e) => {
  let msg = await e.bot.GetFriendList()
  console.log(msg)
}, { name: '测试', priority: '-1' })
