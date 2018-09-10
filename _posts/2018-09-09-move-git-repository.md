---
layout: post
title: Git Repository Migration(代码仓库迁移)
feature-img: /assets/img/move-git-repository/vstf_git.png
tags:
    - Git
---

Git 仓库迁移

## 代码管理库一键导入

许多代码库提供了一键导入的的功能，比如其他位置转到github或者gitlab等，可以直接在操作界面导入开源的或者有访问权限的代码库。

这里不作介绍，

## 本地已有git上传

简单上传本地git代码(clone自其他仓库或者完全本地仓库)到新的分支，只需要添加仓库地址,然后`push`即可。

### 完全同步

1. 添加git源: `git remote add origin [new-git-repository-uri]`
    * 如果 **origin** 已被占用可换其他词
    * **[new-git-repository-uri]** 新的仓库地址(具有写权限)
2. 推送到远程仓库: `git push --all origin` 
    * **origin** 与前一步命名一致)


### 上传部分分支

1. 添加git源: `git remote add origin [new-git-repository-uri]`
2. 推送到远程仓库: `git push origin HEAD:master` 
    * **origin** 与前一步命名一致
    * **HEAD** 指当前分支(branch)如果想上传其它分支，改为对应分支名
    * **master** 远程分支名称



## 参考

* https://git-scm.com/docs/git-push 