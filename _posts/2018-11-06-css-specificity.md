---
layout: post
title: CSS Specificity (CSS 优先级)
tags:
    - CSS
---

## 渲染树(Render Tree)  {#render-tree}

对于一个网页(包括小程序的Page):
HTML解析成一个DOM (Document Object Model)树,样式表会解析成一个 CSSOM(CSS Object Model)树，
二者结合形成一颗渲染树。

![](/assets/img/css-specificity/render-tree-construction.png)

渲染树上的样式即为最终用来渲染呈现的样式(Chrome Computed style)。


## 渲染节点     {#select-node-attribute}

* 自定义样式
    * 代码定义
    * 客户端设置(浏览器默认样式)
* 继承(父级样式)
* CSS标准

对于渲染树上任意一个节点属性的计算:
1. 如果这个节点的属性已经在样式表中定义了，优先采用定义的样式(包括代码中定义和浏览器的默认样式),对于多个定义的优先级会在[后面详细解释](#css-specificity);
2. 如果没有定义，该属性默认可以继承，则向上递归查找祖先定义的该属性；
3. 如果未定义，默认不能继承则采用标准的属性值(一般都会有默认属性，不会到这一步)

<p data-height="265" data-theme-id="0" data-slug-hash="eQdvXv" data-default-tab="html,result" data-user="newfuture" data-pen-title="CSS 样式选择" class="codepen">示例 <a href="https://codepen.io/newfuture/pen/eQdvXv/">CSS 样式选择</a>.</p>

## 样式选择优先级  {#css-specificity}

### important {#import}

`!important`声明的属性具有最高的优先级，除非有多个`!important`时再进行权重比较。

### 样式声明的权重  {#css-specificity-weights}

* 内联样式 
* 样式选择器样式 (包括默认浏览器默认样式)
    * `#ID`选择器
    * `.Class`选择器，属性选择器，伪类选择器
    * `Tag`标签选择器，伪元素选择器

1. 内联样式之间作用与节点，具有最高的权重，包括`style=""`和JS动态修改element的样式。
2. CSS定义中的ID选择器(如`#id{}`)的权重次之;在CSS定义中具有最高的权重;
3. CSS中类选择器(`.class{}`)和属性选择器(`[attribute]{}`)以及伪类选择器(`:hover`)等具有相同的权重；
4. 标签选择器(`h1{}`)和伪元素选择器(`::before`)具有相同的权重

>通配选择符（universal selector）(`*`), 关系选择符（combinators） (`+`,`>`,`~`,` `)和 否定伪类（negation pseudo-class）(`:not()`) 无权重。


总结，根据下面关系，应用权重最高的定义。

> `inline` > `#id` > `.class` = `[attribute]` = `:pseudo-class` > `tag` = `::pseudo-element` > `*`


<p data-height="265" data-theme-id="0" data-slug-hash="GwJabX" data-default-tab="html,result" data-user="newfuture" data-pen-title="定义优先级" class="codepen">See the Pen <a href="https://codepen.io/newfuture/pen/GwJabX/">定义优先级</a>.</p>


如果选择器级联操作，计算级联权重

### 级联样式权重 {#css-combinators-weights}

前面提到，CSS定义中有3类权重id选择器，class选择器，和标签选择器。

分别统计在一个属性中，三中类型出现的频次, 选ID频次最高的，如果有多个相同则再选class权重最高的依次类推。

例如
```css
/*1*/
#i > .content {
    color:red;
}
/*2*/
.c > #i2 {
    color:green;
}
/*3*/
.c > .c2.c3{
    color:yellow;
} 
/*4*/
#ii #ii2{
    color:blue;
}
```
其中1和2的权重一样(一ID一class)，4的权重最高(俩个ID)

如果最高权重的仍有，多个根据出现属性确定优先级。

### 定义顺序 

* inline
* media query
* 代码定义或者浏览器默认，以最后出现优先
 

## 总结

属性计算的优先流程(非实际计算过程)

![](/assets/img/css-specificity/process.png)


## 参考

* [Render Tree Construction(渲染树构建)](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction)
* [CSS Specificity(CSS 优先级计算)](https://developer.mozilla.org/docs/Web/CSS/Specificity)
* [CSS 样式优先级](https://segmentfault.com/a/1190000003860309)

 <script async src="https://static.codepen.io/assets/embed/ei.js"></script>