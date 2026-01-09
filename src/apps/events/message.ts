import { hooks } from 'node-karin'
import { createHookMessageHandler } from './handler/handle'
import { commute, whoat } from './func/message'

hooks.message.group(
  createHookMessageHandler([commute, whoat]),
  { priority: -Infinity })
