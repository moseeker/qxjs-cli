# @moseeker/cli

[![npm version](https://badge.fury.io/js/%40moseeker%2Fcli.svg)](https://badge.fury.io/js/%40moseeker%2Fcli)

MoSeeker Frontend tool.

## Install

```
npm install -g @moseeker/cli
```

# Commands

run `qx --help` for full list of commands.

如果要查看配置文件的结构，可以查看各个命令源代码里的配置类型。

- deploy: 根据配置文件，构建 qxjs 项目，然后将构建后的内容拷贝到一个 git 仓库，自动 打 tag 并 push git 仓库。
