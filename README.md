# @dqjs/cli

[![npm version](https://badge.fury.io/js/%40dqjs%2Fcli.svg)](https://badge.fury.io/js/%40dqjs%2Fcli)

DQJS Frontend tool.

## Install

```
npm install -g @dqjs/cli
```

# Commands

run `qx --help` for full list of commands.

- deploy: 根据配置文件，构建 qxjs 项目，然后将构建后的内容拷贝到一个 git 仓库，自动 打 tag 并 push git 仓库。
- bump: `qx bump qxjs <commit-hash>`, 更新某个包的 git 链接版本，否则每次手动打开 package.json 更新会很麻烦。目前此命令只支持 git 链接的依赖以及 dependencies 里的依赖。

> 如果要查看配置文件的结构，可以查看各个命令源代码里的配置类型。

# Contribute

```
npm run watch
./bin/qx.js -h
```
