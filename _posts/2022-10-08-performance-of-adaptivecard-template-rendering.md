---
layout: post
title: Performance of Adptive Card Template Rendering (C#)
subtitle: Adaptive Card 模板渲染
private: true
tags:
    - dotnet
    - AdaptiveCard
---

## 测试场景

渲染一个卡片列表。三种方式

1. 使用 json 模板渲染单个卡片,代码循环拼接列表
2. 匿名 Object 循环拼接
3. 纯模板渲染 List 生成

理论上, 模板替换 json 字符串是最快的,但是解析模板循环是最慢的。

### 模板渲染卡片

卡片模板

```json
{
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "body": [
        {
            "altText": "${alt}",
            "url": "${src}",
            "type": "Image"
        }
    ]
}
```

渲染逻辑

```cs
public static MessagingExtensionResponse CardLoop(IEnumerable<Img> images)
    {
        List<MessagingExtensionAttachment> attachments = images
            .Select(
                img =>
                    new MessagingExtensionAttachment()
                    {
                        ContentType = "application/vnd.microsoft.card.adaptive",
                        Content = JObject.Parse(CardTemplate.Expand(img)), // template
                        Preview = new Attachment() { }
                    }
            )
            .ToList();

        return new MessagingExtensionResponse
        {
            ComposeExtension = new MessagingExtensionResult("grid", "result", attachments),
        };
    }
```

### 纯粹对象拼接

```cs
 public static MessagingExtensionResponse PureObject(IEnumerable<Img> images)
    {
        List<MessagingExtensionAttachment> attachments = images
            .Select(
                img =>
                    new MessagingExtensionAttachment()
                    {
                        ContentType = "application/vnd.microsoft.card.adaptive",
                        Content = JObject.FromObject(
                            new
                            {
                                type = "AdaptiveCard",
                                body = new[]
                                {
                                    new
                                    {
                                        altText = img.Alt,
                                        url = img.Src,
                                        type = "Image",
                                    }
                                }
                            }
                        ),
                        Preview = new ThumbnailCard()
                        {
                            Images = new List<CardImage>() { new CardImage(img.Src, img.Alt) }
                        }.ToAttachment()
                    }
            )
            .ToList();

        return new MessagingExtensionResponse
        {
            ComposeExtension = new MessagingExtensionResult("grid", "result", attachments),
        };
    }
```

### 模板渲染列表

列表模板

```json
{
    "attachments": [
        {
            "$data": "${Imgs}",
            "content": {
                "type": "AdaptiveCard",
                "body": [
                    {
                        "altText": "${alt}",
                        "url": "${src}",
                        "type": "Image"
                    }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.5"
            },
            "contentType": "application/vnd.microsoft.card.adaptive",
            "preview": {
                "content": {
                    "images": [
                        {
                            "alt": "${alt}",
                            "url": "${src}"
                        }
                    ]
                },
                "contentType": "application/vnd.microsoft.card.thumbnail"
            }
        }
    ],
    "type": "result",
    "attachmentLayout": "grid"
}
```
渲染逻辑
```cs
 public static MessagingExtensionResponse FromTempateList(IEnumerable<Img> images)
    {
        var res = JObject.Parse(ListTemplate.Expand(new {Imgs:images}));
        return new MessagingExtensionResponse
        {
            ComposeExtension = res.ToObject<MessagingExtensionResult>(),
        };
    }
```

## Benchmark result

``` ini

BenchmarkDotNet=v0.13.2, OS=Windows 10 (10.0.19044.2006/21H2/November2021Update)
Intel Xeon CPU E5-1650 v4 3.60GHz, 1 CPU, 12 logical and 6 physical cores
.NET SDK=6.0.401
  [Host]     : .NET 6.0.9 (6.0.922.41905), X64 RyuJIT AVX2
  DefaultJob : .NET 6.0.9 (6.0.922.41905), X64 RyuJIT AVX2
```

|       Method |         Mean |        Error |       StdDev |
|------------- |-------------:|-------------:|-------------:|
|  MixedObject | 26,301.74 μs |   496.889 μs |   531.666 μs |
|   PureObject |     38.26 μs |     0.759 μs |     1.267 μs |
| PureTemplate | 58,808.77 μs | 1,139.154 μs | 1,481.222 μs |

结果上看，
1. 纯Object的拼接新能上最佳(代码逻辑，效率最高)
2. 直接模板渲染N张卡片的列表,比N慢一倍。（数组模板效率最低）
