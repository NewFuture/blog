---
layout: post
title: React Query and SWR
subtitle: API数据缓存数据请求更新
private: true
tags:
  - React
  - Front-End
---

更好的体验，页面显示应当尽可能**快** 而且 尽可能**准**

## 目录

- SWR (stale-while-revalidate)
- useSWR
- useReactQuery

## SWR (stale-while-revalidate)

### stale-while-revalidate 策略(思想)

SWR 是缓存控制协议(在指定的时间范围内，可以先使用失效的旧数据，同时请求刷新的数据)

比如网页返回头
```
Cache-Control: max-age=60, stale-while-revalidate=3600
```
表示可缓存60s, 在此之后3600s之内可以先使用失效的缓存数据并刷新数据。

即1分钟之后，缓存失效，再次后1小时内请求数据时仍可先使用旧的缓存数据并异步获取新的数据更新缓存。


### SWR for FE

对于前端数据请求缓存常见的实现原理(server端不一定实现缓存)

> The name “SWR” is derived from stale-while-revalidate, a cache invalidation strategy popularized by HTTP RFC 5861. 
> SWR first returns the data from cache (stale), then sends the request (revalidate), and finally comes with the up-to-date data again.

1. 优先使用本地缓存(stale)数据，立即显示
2. 重新请求检查最新数据是否更新(revalidate),有变化则更新本地状态

核心功能 

* **维护请求的数据缓存**
* **自动检查和更新服务器端数据**

## useSWR

https://github.com/vercel/swr

API

```js
const { data, error, isValidating, mutate } = useSWR(key, fetcher, options);

```

* `key` 数组参数
* 返回`data`和`error` 返回数据状态

## react query

https://github.com/tannerlinsley/react-query

