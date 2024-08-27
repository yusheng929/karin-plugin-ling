import { Version } from '#components'
import common from 'node-karin'

const makeForwardMsg = await (async () => {
      return async (e, elements) => {
        return common.makeForward(elements, e.self_id, e.sender.name || e.sender.nick)
      }
})()

export default makeForwardMsg
