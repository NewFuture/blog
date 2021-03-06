---
layout: post
title: Intro to HTML
subtitle: HTML基础简介
private: true
# feature-img: 
---

> 全篇主要内容根据三年前系列的内部培训,结合HTML5相关书籍和网络教程整理而来。


## 概览导图                 {#mind-mapping-overview}

![](/assets/img/html-intro/html.png)

HTML5 通常包括两个部分:
* 元数据和描述 `head`
* 主体内容/信息 `body`

在更古老的HTML4中主体部分还可能是`frame`组成的页面框架`frameset`。(HTML5 标准中已经移除)


## 常用标签               {#tags}

### 无语义标签
* `div` 无语义的块级元素(block)
* `span` 无语言的块内内容通常是文字(inline block)

### 语义化标签

#### 页面文章组织结构

* `header` 页面/文章/章节的头部(顶部)内容
* `main` 页面/文章/章节的的主体内容
* `footer` 页面/文章/章节的尾部内容 (或页脚）
* `aside` 页面边栏
* `nav` 导航
* `article` 文章
* `section` 章节
* `h1`,`h2`,`h3`,`h4`,`h5`,`h6`标题
* `p` (paragraph) 段落
* `address` 文档/文章的作者信息
* `details` > `summary` 详情和摘要(带折叠效果，依赖浏览器实行) 

#### 格式相关

* `a` 超链接
* ` `


### 表单标签

* `form`	定义表单主体
* `input`	输入框
* `label`	设置显示名 `input`(可点击获取焦点)
* `textarea` 输入文本区域
* `button`	按钮
* `select`	下拉菜单配合option使用
* `option`	select的选项
* `optgroup` 将option组合
* `fieldset` 将表单字段组合在一些
* `legend`  对 `fieldset` 说明
* `datalist`	datalist 选项
* `output`	显示结果

### 图片视频音频


### 其他


## HTML5 通用属性         {#html5}

## HTML5 与 HTML4 声明        {#html5-html4-differences}

```html
<!DOCTYPE html>
```

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0//EN" "http://www.w3.org/TR/REC-html40/strict.dtd">
```

## 参考                   {#reference}

* [HTML（超文本标记语言）- MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
* [Html5和Html4的区别 - 简书](https://www.jianshu.com/p/5dbc711331e2)
* [HTML 教程 - 菜鸟教程](http://www.runoob.com/html/html-tutorial.html)
* [HTML5 Tutorial - w3schools](https://www.w3schools.com/html/)
* [HTML Tags - w3schools](https://www.w3schools.com/tags/ref_byfunc.asp)
* [HTML Guide Beginners](https://www.websiteplanet.com/blog/html-guide-beginners/)
