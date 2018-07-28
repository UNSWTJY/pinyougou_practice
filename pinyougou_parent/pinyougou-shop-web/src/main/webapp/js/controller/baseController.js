app.controller('baseController', function ($scope) {
    //分页控件配置
    $scope.paginationConf = {
        currentPage: 1,
        totalItems: 10,
        itemsPerPage: 10,
        perPageOptions: [10, 20, 30, 40, 50],
        onChange: function () {
            $scope.reloadList();//重新加载

        }
    }
    //页面刷新
    $scope.reloadList = function () {
        //更新页码
        $scope.search($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage);
    };
    //定义要删除的id数组
    $scope.selectIds = [];
    //更新数组数据
    $scope.updateSelection = function ($event, id) {
        if ($event.target.checked) {
            $scope.selectIds.push(id);
        } else {
            var idIndex = $scope.selectIds.indexOf(id);
            $scope.selectIds.splice(idIndex, 1);
        }
    };
    //定义搜索对象
    $scope.searchEntity = {};

    //提取json数据
    $scope.jsonToString = function (jsonString, key) {
        var json = JSON.parse(jsonString);
        var value = "";
        for (var i = 0; i < json.length; i++) {
            if (i > 0) {
                value += ",";
            }
            value += json[i][key];
        }
        return value;

    };

    //判断集合list是否有key值为value的specItem
    $scope.searchObjectByKey = function (list, key, value) {

        for (var i = 0; i < list.length; i++) {
            if (list[i][key] == value) {
                return list[i];
            }
        }
        return null;

    };

});