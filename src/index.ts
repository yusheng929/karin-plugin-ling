import { logger } from 'node-karin'
import { pkg } from '@/utils/config'
import { basename } from '@/utils/dir'

/** 请不要在这编写插件 不会有任何效果~ */

logger.info('-----------------')
logger.info(`${basename}${pkg().version}初始化~`)
logger.info('\x1b[38;2;173;216;230m少女祈祷中...\x1b[0m')
logger.info(`\x1b[38;2;255;182;193m
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
