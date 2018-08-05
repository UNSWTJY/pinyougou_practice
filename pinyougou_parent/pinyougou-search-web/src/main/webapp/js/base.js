var app = angular.module("pinyougou", ["infinite-scroll"]);
//构建模块
//过滤器
app.filter('trustAsHtml', ['$sce', function ($sce) {
    return function (data) {
        return $sce.trustAsHtml(data);

    };

}]);