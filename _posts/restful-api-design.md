
* 资源(`URL`)
* 动作(`Method`)

## REST

* Level 0 - URI (定义一个 URI，所有操作是对此 URI 发出的 POST 请求。)
* Level 1 - Resources (为各个资源单独创建 URI。)
* Level 2 - HTTP Verbs (使用 HTTP 方法来定义对资源执行的操作。)
* Level 3 - Hypermedia Controls (使用超媒体)

## 资源




examples

```
PUT /gists/:id/star
DELETE /gists/:id/star
POST /gists/:id/forks
```


## References

* https://martinfowler.com/articles/richardsonMaturityModel.html
* https://docs.microsoft.com/zh-cn/azure/architecture/best-practices/api-design
