# jquery-star-rating

基于jQuery的星级评价小插件，[查看demo](https://zhanguangcheng.github.io/jquery-star-rating/demo)

## 快速使用

导入js

```html
<!-- 星星容器 -->
<div class="star"></div>

<!-- 导入jQuery -->
<script src="http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js"></script>
<!-- 导入插件 -->
<script src="src/jquery-star-rating.min.js"></script>
```

调用

```javascript
$('.star').starRating();
```


## 配置选项

* `readonly` 是否只读，默认`false`
* `defaultStar` 默认的星星数
* `starNumber` 总的星星数量，默认`5`
* `step` 星星的最小单位，默认`0.5`
* `theme` 主题
* `eventHover` hover星星事件
* `eventOut` 移出星星事件
* `eventChange` 改变星星事件

## 事件

> 可用配置选项指定事件，因为默认将配置中的选项绑定了对应的事件。

* `starRating:hover` hover星星事件
* `starRating:out` 移出星星事件
* `starRating:change` 改变星星事件
