
* 资源(`URL`)
* 动作(`Method`)

## REST

REST(Representational State Transfer, 表现层状态转移)

* 用URI来定位具体的资源
* 用HTTP请求的Content-Type字段来描述资源的表现形式
* 用HTTP动词来描述对资源的具体操作

### Web API 4境界

* Level 0 - URI (定义一个 URI，所有操作是对此 URI 发出的 POST 请求。)
* Level 1 - Resources (为各个资源单独创建 URI。)
* Level 2 - HTTP Verbs (使用 HTTP 方法来定义对资源执行的操作。)
* Level 3 - Hypermedia Controls (使用超媒体)

## 资源

所有内容


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


#### 版本
* **Path** [Facebook, Microsoft Graph] √
* header [Github] 
* query string 

### 响应

#### 参数和字段名称

命名和语言风格习惯有关，流行的主要有两种方式

* lower_case 小写下划线 (Like Github Facebook API)
* **camelCase** 小写驼峰 (Usually used in Microsoft API) √

#### 状态码

| code | status | method | 说明| 
|:---:|:---|:---|:--- |
| 200 | OK |GET|服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
| 201 | CREATED |POST/PUT/PATCH|用户新建或修改数据成功。
| 202 | Accepted |*|表示一个请求已经进入后台排队（异步任务）
| 204 | NO CONTENT |DELETE|用户删除数据成功。
| 400 | INVALID REQUEST |POST/PUT/PATCH|用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
| 401 | Unauthorized |*|表示用户没有权限（令牌、用户名、密码错误）。
| 403 | Forbidden |*|表示用户得到授权（与401错误相对），但是访问是被禁止的。
| 404 | NOT FOUND |*|用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
| 406 | Not Acceptable |GET|用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
| 410 | Gone |GET|用户请求的资源被永久删除，且不会再得到的。
| 422 | Unprocesable entity |POST/PUT/PATCH|当创建一个对象时，发生一个验证错误。
| 500 | INTERNAL SERVER ERROR |*|服务器端发生错误，用户将无法判断发出的请求是否成功。
| 503 | Service Unavailable | * | 服务器临时性出错.

#### 错误

https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#errorresponse--object

```HTTP
GET /customers/3?nameFiled=firstName HTTP/1.1
```

```HTTP
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":3,"firstName":"Contoso","address":"1 Microsoft Way Redmond WA 98053"}
```

## References

* https://martinfowler.com/articles/richardsonMaturityModel.html
* https://docs.microsoft.com/zh-cn/azure/architecture/best-practices/api-design
* https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md
