![Ling](https://socialify.git.ci/yusheng929/karin-plugin-ling/image?font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto)

<div align="center">

# Karin-plugin-Ling

[![Gitee](https://img.shields.io/badge/Gitee-铃插件-black?style=flat-square&logo=gitee)](https://gitee.com/yusheng929/karin-plugin-ling) [![GitHub](https://img.shields.io/badge/GitHub-铃插件-black?style=flat-square&logo=github)](https://github.com/yusheng929/karin-plugin-ling) [![Karin](https://img.shields.io/badge/Karin-black?style=flat-square&logo=dependabot)](https://github.com/KarinJS/Karin)

![动态访问量](https://count.kjchmc.cn/get/@yusheng/karin-plugin-ling?theme=rule34)

</div>

**_Karin 的便携操作插件_**

## ⬇️ 安装

* 使用编译产物 **`build 分支`**
   <details>
   <summary>点击展开</summary>

   1. 克隆源码
   ```sh
   git clone --depth=1 -b build https://github.com/yusheng929/karin-plugin-ling.git ./plugins/karin-plugin-ling/
   ```
   <details>
   <summary>如果你的 git 无法访问至 Github...点击打开查看解决方法</summary>

   > ```sh
   > git clone --depth=1 -b build https://gitee.com/yusheng929/karin-plugin-ling.git ./plugins/karin-plugin-ling/
   > ```

   </details>
   <br>

   2. 安装依赖
   安装依赖，在 **Karin 根目录** 下运行
   ```sh
   pnpm install --filter=karin-plugin-ling
   ```

   </details>

* 使用 **`包管理器`** 安装（非常推荐）
   <details>
   <summary>点击展开</summary>

   在 **Karin 根目录** 下运行
   ```sh
   pnpm add karin-plugin-ling@latest -w
   ```
   </details>

* 使用 Release **`发行版`**（不推荐）
    <details>
    <summary>点击展开</summary>

    <p style="color: red; font-weight: 700;">不推荐该方式，后续只能重复下载 Release 包进行更新，且无法通过 Git 或 包管理器 进行更新</p>
    
    1. 打开 Release 页面: https://github.com/yusheng929/karin-plugin-ling/releases
    2. 找到最新的版本，下载名为 `build.zip` 的压缩包
    3. 在 `plugins/` 目录下解压该压缩包，选择替换所有文件。

    * 完成后相关源码应在 `Karin根目录/plugins/karin-plugin-ling/` 内<br><br>

    解压完成后在插件目录下运行
    ```sh
    pnpm install   
    ```

    或者在 **Karin 根目录** 下运行
    ```sh
    pnpm install --filter=karin-plugin-ling
    ```

    </details>


## 📖 功能

 **~~更多信息可打开 [文档主页](https://yusheng929.github.io/karin-plugin-ling/) 阅读。~~**<br>
反馈群：[950407830](https://qm.qq.com/q/9THnE5GwU0)

## 🛠️ 开发

<details>
<summary>点击展开</summary>

1. [fork](https://github.com/yusheng929/karin-plugin-ling/fork) 本项目到自己的仓库
2. 克隆到本地
```sh
git clone https://github.com/你的GitHub用户名/karin-plugin-ling.git
```
3. 进入项目目录
```sh
cd karin-plugin-ling/
```
4. 初始化开发环境
```sh
pnpm run init
```
5. 安装依赖
```sh
pnpm install
```
6. 启动开发环境 
```sh
pnpm dev
```
</details>

## 🌟 贡献者

> 🌟星光闪烁，你们的智慧如同璀璨的夜空。感谢所有为 **karin-plugin-ling** 做出贡献的人！

<a href="https://github.com/yusheng929/karin-plugin-ling/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yusheng929/karin-plugin-ling" />
</a>

![Alt](https://repobeats.axiom.co/api/embed/76efd64f02ce043df06e2cd21913a0981b87f069.svg "Repobeats analytics image")

## Star History

<a href="https://star-history.com/#yusheng929/karin-plugin-ling&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=yusheng929/karin-plugin-ling&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=yusheng929/karin-plugin-ling&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=yusheng929/karin-plugin-ling&type=Date" />
 </picture>
</a>

## 😊 鸣谢

本项目的开发参考了以下开源项目部分代码，排名不分先后

**部分代码借鉴**

- [yeyang52/yenai-plugin](https://github.com/yeyang52/yenai-plugin)
- [ikenxuan/karin-plugin-kkk](https://github.com/ikenxuan/karin-plugin-kkk)
- [xfdown/xiaofei-plugin](https://github.com/xfdown/xiaofei-plugin)
- [MliKiowa/napcat-protobuf-runtime](https://github.com/MliKiowa/napcat-protobuf-runtime)
- 更多待补充...

**友情链接**
- Karin 框架 [**GitHub**](https://github.com/Karinjs/Karin) | [**文档**](https://karin.fun)

## 🧷 许可证
[**GPL-3.0**](./LICENSE)

## ❗ 声明

本项目提供的开源代码是出于学习进行开发。如果您认为该项目侵犯了您的知识产权或其他合法权益，请通过 **[<i class="fa-brands fa-qq fa-flip"></i> QQ](https://qm.qq.com/q/Y6DoRfJbmo)** 向我们提供书面通知。我们将在收到有效通知后，尽快进行审查，并采取必要的措施。

未经同意，禁止将本项目的开源代码用于任何商业目的。因使用本项目产生的一切问题与后果由使用者自行承担，项目开发者不承担任何责任