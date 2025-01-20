![Ling](https://socialify.git.ci/yusheng929/karin-plugin-ling/image?font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto)

<div align="center">

# Karin-plugin-Ling

[![Gitee](https://img.shields.io/badge/Gitee-铃插件-black?style=flat-square&logo=gitee)](https://gitee.com/yusheng929/karin-plugin-ling) [![GitHub](https://img.shields.io/badge/GitHub-铃插件-black?style=flat-square&logo=github)](https://github.com/yusheng929/karin-plugin-ling) [![Karin](https://img.shields.io/badge/Karin-black?style=flat-square&logo=dependabot)](https://github.com/KarinJS/Karin) <a href='https://github.com/yusheng929/karin-plugin-ling/stargazers'><img src='https://github.com/yusheng929/karin-plugin-ling/badge/star.svg?theme=dark' alt='star'></img></a><br>

![动态访问量](https://count.kjchmc.cn/get/@yusheng/karin-plugin-ling?theme=rule34)<br>

[![yusheng929/karin-plugin-ling](https://gitee.com/yusheng929/karin-plugin-ling/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b)](https://gitee.com/yusheng929/karin-plugin-ling)

</div>

# 安装教程

### 1. 克隆安装

<details> <summary>点击展开</summary>

karin根目录下执行

GitHub安装(国外推荐)

```bash
git clone --depth=1 -b dev https://github.com/yusheng929/karin-plugin-ling ./plugins/karin-plugin-ling
```

ghproxy安装(国内推荐)(镜像源)

```bash
git clone --depth=1 -b dev https://github.com/yusheng929/karin-plugin-ling ./plugins/karin-plugin-ling
```

Gitee安装(国内推荐)(镜像源)

```bash
git clone --depth=1 -b dev https://github.com/yusheng929/karin-plugin-ling ./plugins/karin-plugin-ling
```

安装依赖

```bash
pnpm install --filter=karin-plugin-ling
```

</details>

### 2. 使用包管理器安装

<details> <summary>点击展开</summary>

karin根目录下执行

```bash
pnpm install karin-plugin-ling
```

</details>

### 3. 使用 release 发行版编译安装 (不推荐)

<details> <summary>点击展开</summary>

极其不推荐，需要自行编译，且后续无法通过 Git 或者包管理器更新。

* 打开 [release](https://github.com/yusheng929/karin-plugin-ling/releases) 页面
* 下载最新版本的插件压缩包
* 解压到 plugins/ 目录下

解压完成后进入 plugins/karin-plugin-ling 目录，执行下面命令编译

```bash
pnpm run build
```

编译完成后在插件目录下执行

```bash
pnpm install
```

或者在karin根目录下执行

```bash
pnpm install --filter=karin-plugin-ling -P
```

</details>

### 4. 克隆 源码 分支编译安装 (不推荐)

<details> <summary>点击展开</summary>

* 克隆仓库到本地

```bash
git clone --depth=1 -b npm https://github.com/yusheng929/karin-plugin-ling.git ./plugins/karin-plugin-ling
```

* 进入仓库目录

```bash
cd plugins/karin-plugin-ling
```

* 安装依赖

```bash
pnpm install
```

* 编译插件

```bash
pnpm run build
```

* 编译完成后可正常启动 Karin

</details>

# 当前功能

![HELP](resources/help.png)

## 配置文件

```js
Karin/@karinjs/karin-plugin-ling/config
```

# 未来计划

- [X] Bot的前缀快捷设置
- [ ] 增加进群申请通知

# 负责声明

- 功能仅限内部交流与小范围使用
- 严禁将本插件用于任何商业用途或盈利
- 图片与其他素材均来自于网络
- 仅供交流学习娱乐
- 如有侵权请联系（issues）看到会立即删除

# 联系方式

不欢迎加入测试群聊: ~~636023444~~

## 致谢


|                             Nickname                             | Contribution               |
| :----------------------------------------------------------------: | ---------------------------- |
|     [yenai-plugin](https://github.com/yeyang52/yenai-plugin)     | 部分代码参考椰奶插件所实现 |
|           [shijinn520](https://github.com/shijinn520)           | 提供技术支持               |
| [karin-plugin-kkk](https://github.com/ikenxuan/karin-plugin-kkk) | 部分代码借鉴               |
