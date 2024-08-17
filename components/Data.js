// import lodash from 'lodash'
// import Version from './Version.js'
// import { plugin, logger } from 'node-karin'

// export default class {
//   constructor ({
//     id,
//     name,
//     dsc,
//     event = 'message',
//     priority = -1
//   }, rule, task) {
//     this.id = id
//     this.name = name
//     this.dsc = dsc || name
//     this.event = event
//     this.priority = priority
//     this.apps = []
//     this.tasks = []
//     this.rule(rule)
//     this.task(task)
//   }

//   rule (name, reg, fnc, cfg = {}) {
//     if (!name) return false
//     if (lodash.isPlainObject(name)) {
//       lodash.forEach(name, (p, k) => {
//         this.rule(k, p.reg, p.fnc, p.cfg)
//       })
//     } else {
//       this.apps.push({ name, reg, fnc, cfg })
//     }
//   }

//   task (name, dsc, cron, fnc, cfg = {}) {
//     if (!name) return false
//     if (lodash.isPlainObject(name)) {
//       lodash.forEach(name, (p, k) => {
//         this.task(k, p.name, p.cron, p.fnc, p.cfg)
//       })
//     } else {
//       this.tasks.push({ name, dsc, cron, fnc, cfg })
//     }
//   }

//   create () {
//     const { name, dsc, event, priority } = this
//     const rule = []
//     const task = []
//     const cls = class extends plugin {
//       constructor () {
//         super({
//           name: `[${Version.pluginName}]` + name,
//           dsc: dsc || name,
//           event,
//           priority,
//           rule,
//           task
//         })
//       }
//     }

//     for (const { name, reg, fnc, cfg } of this.apps) {
//       rule.push({
//         reg,
//         fnc: name,
//         ...cfg
//       })
//       cls.prototype[name] = fnc
//     }

//     for (const { name, dsc, cron, fnc, cfg } of this.tasks) {
//       task.push({
//         name: dsc,
//         cron,
//         fnc: name,
//         ...cfg
//       })
//       cls.prototype[name] = fnc
//     }
//     return cls
//   }

//   async change () {
//     try {
//       const dir = Version.pluginName + '/apps'
//       const name = this.id + '.js'
//       const PluginsLoader = (await import('../../../lib/plugins/loader.js')).default
//       PluginsLoader.uninstallApp(dir, name)
//       PluginsLoader.createdApp(dir, name, true)
//         default:
//     return false
// } catch (error) {
//   logger.error(`[${Version.pluginName}]重载js: apps/${this.id}.js错误\n`, error)
// }
//   }
// }
