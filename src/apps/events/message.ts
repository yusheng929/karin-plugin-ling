import { hooks } from 'node-karin'
import { createHookMessageHandler } from './handler/handle'
import { commute, setRequestResult, whoat } from './func/message'

hooks.message.group(
  createHookMessageHandler([commute, whoat, setRequestResult]),
  { priority: -Infinity })
