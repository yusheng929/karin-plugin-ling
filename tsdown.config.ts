import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/apps/**/*.ts'], // 入口文件
  format: ['esm'], // 输出格式
  target: 'node18', // 目标环境
  sourcemap: false, // 是否生成 sourcemap
  clean: true, // 是否清理输出目录
  dts: false, // 是否生成 .d.ts 文件 没啥事可以不需要生成类型，除非你的插件会被其他插件调用。
  outDir: 'lib', // 输出目录
  treeshake: true, // 树摇优化
  minify: false, // 压缩代码
  shims: true,
  deps: {
    neverBundle: [
      ...[/^node-karin/],
      ...[/^@karinjs\//],
    ]
  }
})
