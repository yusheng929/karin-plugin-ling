import { Version, Config } from '#components'
import { logger } from 'node-karin'

global.Ling = new (await import("./Ling.js")).default

logger.info('-----------------')
logger.info(`${Version.pluginName}${Config.package.version}初始化~`)
logger.info('\x1b[34m少女祈祷中...\x1b[0m')
logger.info(`\x1b[34m
                 .::::..
      ::::rrr7QQJi::i:iirijQBBBQB.
      BBQBBBQBP. ......:::..1BBBB
      .BuPBBBX  .........r.  vBQL  :Y.
       rd:iQQ  ..........7L   MB    rr
        7biLX .::.:....:.:q.  ri    .
         JX1: .r:.r....i.r::...:.  gi5
         ..vr .7: 7:. :ii:  v.:iv :BQg
         : r:  7r:i7i::ri:DBr..2S
      i.:r:. .i:XBBK...  :BP ::jr   .7.
      r  i....ir r7.         r.J:   u.
     :..X: .. .v:           .:.Ji
    i. ..i .. .u:.     .   77: si   1Q
   ::.. .r .. :P7.r7r..:iLQQJ: rv   ..
  7  iK::r  . ii7r LJLrL1r7DPi iJ     r
    .  ::.:   .  ri 5DZDBg7JR7.:r:   i.
   .Pi r..r7:     i.:XBRJBY:uU.ii:.  .
   QB rJ.:rvDE: .. ri uv . iir.7j r7.
  iBg ::.7251QZ. . :.      irr:Iu: r.
   QB  .:5.71Si..........  .sr7ivi:U
   7BJ .7: i2. ........:..  sJ7Lvr7s
    jBBdD. :. ........:r... YB  Bi
       :7j1.                 :  :\x1b[0m`)
logger.info('-------^_^-------')