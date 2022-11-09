---
layout: post
title: My Stickers Bot Query Optimization
subtitle: 表情包扩展Bot查询优化
tags:
    - Optimization
---

## Query 流程 关键路径

![call flow](/assets/img/my-stickers-bot-query-optimization/stickers-bot-query.png)

1. [Teams Client] 客户端点击 Teams 触发 Teams 事件事件 （完全不可控）
2. [Teams Server] Teams Server 通过 Bot Framework 调用 Stickers Bot API （基本不可控）
3. [Stickers Server] **查询用户收藏列表数据 (SQL 查询，可控)** （10 ~ 200 ms）
4. [Stickers Server] **查询 Tenant 收藏列表数据 (SQL 查询，可控)** （5 ~ 50 ms）
5. [Stickers Server] **查询 官方表情列表数据 (remote json ，可控)** （300 ms）
6. [Stickers Server] **生成 卡片列表 (json template ，可控)** (1~10 ms)
7. [Server Client] 返回数据到客户端 （server response to client）
8. [Client] 渲染卡片列表，下载预览图片

可优化的关键路径有四个（3.4) 壳归为一类

-   用户 和 公司 列表查询
-   官方列表查询
-   卡片生成

## 官方表情查询优化

## 数据库表情查询优化

## Card 生成优化

## 初次查询优化

## DNS 优化

## 优化结果
