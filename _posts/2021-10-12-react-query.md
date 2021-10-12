---
layout: post
title: React Query and SWR
subtitle: API数据缓存数据请求更新
private: true
tags:
  - React
  - Front-End
---

## 目录

- SWR ()
- useSWR
- useReactQuery

## SWR (stale-while-revalidate)




常见的实现原理

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

