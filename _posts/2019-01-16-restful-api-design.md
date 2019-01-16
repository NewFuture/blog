---
layout: post
title: restful-api-design (restful api 设计)
tags:
    - API
---

* 资源(`URL`)
* 动作(`Method`)


## REST

REST(Representational State Transfer, 表现层状态转移,主语是Resource)

* 用URI来定位具体的资源
* 用HTTP请求的Content-Type字段来描述资源的表现形式
* 用HTTP动词来描述对资源的具体操作

REST 描述的三个内容

> #### 资源 (Resource)：
> 对象的单个实例。 例如，一只动物。它可以是一段文本、一张图片、一首歌曲、一种服务，总之就是一个具体的实在。你可以用一个URI（统一资源定位符）指向它，每种资源对应一个特定的URI。要获取这个资源，访问它的URI就可以，因此URI就成了每一个资源的地址或独一无二的识别符。
集合：对象的集合。 例如，动物。
>
> #### 表现层（Representation）:
> "资源"是一种信息实体，它可以有多种外在表现形式。我们把"资源"具体呈现出来的形式，叫做它的"表现层"（Representation）。
> 比如，文本可以用txt格式表现，也可以用HTML格式、XML格式、JSON格式表现，甚至可以采用二进制格式；图片可以用JPG格式表现，也可以用PNG格式表现。
>
>
> URI只代表资源的实体，不代表它的形式。严格地说，有些网址最后的".html"后缀名是不必要的，因为这个后缀名表示格式，属于"表现层"范畴，而URI应该只代表"资源"的位置。它的具体表现形式，应该在HTTP请求的头信息中用Accept和Content-Type字段指定，这两个字段才是对"表现层"的描述。
>
> #### 状态转化（State Transfer）
> 访问一个网站，就代表了客户端和服务器的一个互动过程。在这个过程中，势必涉及到数据和状态的变化。互联网通信协议HTTP协议，是一个无状态协议。这意味着，所有的状态都保存在服务器端。因此，如果客户端想要操作服务器，必须通过某种手段，让服务器端发生"状态转化"（State Transfer）。而这种转化是建立在表现层之上的，所以就是"表现层状态转化"。
> 客户端用到的手段，只能是HTTP协议。具体来说，就是HTTP协议里面，四个表示操作方式的动词：GET、POST、PUT、DELETE。它们分别对应四种基本操作：GET用来获取资源，POST用来新建资源（也可以用于更新资源），PUT用来更新资源，DELETE用来删除资源。


### Web API 4境界

* Level 0 - URI (定义一个 URI，所有操作是对此 URI 发出的 POST 请求。)
* Level 1 - Resources (为各个资源单独创建 URI。)
* Level 2 - HTTP Verbs (使用 HTTP 方法来定义对资源执行的操作。)
* Level 3 - Hypermedia Controls (使用超媒体)


### REST API 使用无状态

HTTP 请求应是独立的并可按任意顺序发生，因此保留请求之间的瞬时状态信息并不可行。 
信息的唯一存储位置就在资源内，并且每个请求应是原子操作。 
此约束可让 Web 服务获得高度可伸缩性，因为无需保留客户端与特定服务器之间的关联。 
任何服务器可以处理来自任何客户端的任何请求。
也就是说，其他因素可能会限制可伸缩性。

## 资源

每个URI对应一个资源或者资源集合

`https://{serviceRoot}/{collection}/{id}`

> * {serviceRoot} – the combination of host (site URL) + the root path to the service
> * {collection} – the name of the collection, unabbreviated, pluralized (无缩写复数)
> * {id} – the value of the unique id property. When using the "/" pattern this MUST be the **raw string/number/guid** value with no quoting but properly escaped to fit in a URL segment.

### 集合 collection

* collection是一类资源实体的总称
* collection内可以嵌套collection (属性或从属关系)

### URI常用约定

#### 名词应该使用复数
所用的名词往往和数据库的表名对应，而数据库的表是一组记录的集合，因此URL中的名词即表示一组资源的**集合**，故URI中的名词要使用复数
* https://api.example.com/v1/students
* https://api.example.com/v1/schools
* https://api.example.com/v1/employees

#### URL中不能使用动词
URI代表着一个资源，是一个实体，应该是名词，而不要把具体的动作放在URL中，对资源的操作应该通过HTTP的动词来实现。


## Verb

### Method

HTTP 协议定义了大量为请求赋于语义的方法。 大多数 RESTful Web API 使用的常见 HTTP 方法是：

* GET (Select)：一个具体的资源或者一个资源列表。
* POST （Create/Insert）： 在服务器上创建一个新的资源。
* PUT （Update/Upsert）：以整体的方式更新服务器上的一个资源。
* PATCH （Update）：只更新服务器上一个资源的一个属性。
* DELETE （Delete）：删除服务器上的一个资源。

### examples

下表汇总了使用电子商务示例的大多数 RESTful 实现所采用的常见约定

| **资源** | **POST** | **GET** | **PUT** | **DELETE** |
| --- | --- | --- | --- | --- |
| /customers |创建新客户 |检索所有客户 |批量更新客户 |删除所有客户 |
| /customers/1 |错误 |检索客户 1 的详细信息 |如果客户 1 存在，则更新其详细信息 |删除客户 1 |
| /customers/1/orders |创建客户 1 的新订单 |检索客户 1 的所有订单 |批量更新客户 1 的订单 |删除客户 1 的所有订单 |

## REST API of Github 

* issues

```
GET /issues                                      列出所有的 issue
GET /orgs/:org/issues                            列出某个组织的 issue
GET /repos/:owner/:repo/issues/:number           获取某个项目的某个 issue
POST /repos/:owner/:repo/issues                  为某个项目创建 issue
PATCH /repos/:owner/:repo/issues/:number         修改某个 issue
PUT /repos/:owner/:repo/issues/:number/lock      锁住某个 issue
DELETE /repos/:owner/:repo/issues/:number/lock   删除某个 issue
```

* star
```
PUT /gists/:id/star
DELETE /gists/:id/star
POST /gists/:id/forks
```

## practices

### 参数
* PATH
* URL
* HEADER
* BODY

#### Header参数

由于浏览器和协议限制协议

> 1. Any custom headers MUST be also accepted as parameters.
> 2. Required standard headers MAY be accepted as parameters.
> 3. Required headers with security sensitivity (e.g., Authorization header) MIGHT NOT be appropriate as parameters;

```
GET /customers/3?nameFiled=firstName HTTP/1.1
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":3,"firstName":"Contoso","address":"1 Microsoft Way Redmond WA 98053"}
```

### URL

格式规范
根据RFC3986定义，URL是大小写敏感的。所以为了避免歧义，尽量使用小写字母。

RESTful API 应具备良好的可读性，当url中某一个片段（segment）由多个单词组成时，建议使用 **-** 来隔断单词，而不是使用 \_。这主要是因为，浏览器中超链接显示的默认效果是文字并附带下划线，如果API以\_隔断单词，二者会重叠，影响可读性。

### 协议
使用HTTPs协议还是HTTP协议本身和RESTful API并无关系

提供给用户的API，总是使用HTTPs协议。

### API域名
* 独立域名 https://api.example.com/ [Facebook, Microsoft Graph,Facebook 几乎所有API开发平台] √
* 路径 https://www.example.com/api/ (常用于小型项目，前后分离)

### 版本
* **Path** [Facebook, Microsoft Graph] √
* header [Github] 
* query string 

### 响应

### 数据格式

数据传输量，易读性和解析便利性考虑, **JSON** 优先

#### 参数和字段名称

命名和语言风格习惯有关，流行的主要有两种方式

* lower_case 小写下划线 (Like Github Facebook API)
* **camelCase** 小写驼峰 (Usually used in Microsoft API) √

#### 状态码

| code | status | method | 说明| 
|:---:|:---|:---|:--- |
| 200 | OK |GET|服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
| 201 | CREATED |POST/PUT/PATCH|用户新建或修改数据成功。
| 202 | Accepted | * |表示一个请求已经进入后台排队（异步任务）
| 204 | NO CONTENT |DELETE|  用户删除数据成功。
| 400 | INVALID REQUEST |POST/PUT/PATCH|用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
| 401 | Unauthorized | * |表示用户没有权限（令牌、用户名、密码错误）。
| 403 | Forbidden |* | 表示用户得到授权（与401错误相对），但是访问是被禁止的。
| 404 | NOT FOUND | * | 用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
| 406 | Not Acceptable |GET | 用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
| 410 | Gone | GET | 用户请求的资源被永久删除，且不会再得到的。
| 422 | Unprocesable entity |POST/PUT/PATCH|当创建一个对象时，发生一个验证错误。
| 500 | INTERNAL SERVER ERROR | * | 服务器端发生错误，用户将无法判断发出的请求是否成功。
| 503 | Service Unavailable | * | 服务器临时性出错.

#### 错误

https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#errorresponse--object


## References

* <https://martinfowler.com/articles/richardsonMaturityModel.html>
* <https://docs.microsoft.com/zh-cn/azure/architecture/best-practices/api-design>
* <https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md>
* <https://tools.ietf.org/html/rfc3986>
* <https://cizixs.com/2016/12/12/restful-api-design-guide/>
* <https://graphql.org>

