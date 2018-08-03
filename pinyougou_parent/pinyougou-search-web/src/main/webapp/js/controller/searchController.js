app.controller('searchController', function ($scope, searchService) {
    //搜索
    $scope.search = function () {
        if ($scope.searchMap.keywords != "") {
            searchService.search($scope.searchMap).success(function (response) {
                $scope.resultMap = response;

            });
        } else {
            alert("请先输入搜索条件");
        }


    };
    //定义搜索项
    $scope.searchMap = {keywords: "", category: "", brand: "", spec: {}, price: ""};
    //添加搜索项
    $scope.addSearchMap = function (key, value) {
        if ($scope.searchMap.keywords != "") {
            if (key == 'category' || key == 'brand' || key == 'price') {
                $scope.searchMap[key] = value;
            } else {
                $scope.searchMap.spec[key] = value;
            }
            $scope.search();
        } else {
            alert("请先输入搜索条件");
        }

    };
    //移除搜索项
    $scope.removeSearchMap = function (key) {
        if ($scope.searchMap.keywords != "") {
            if (key == 'category' || key == 'brand' || key == 'price') {
                $scope.searchMap[key] = "";
            } else {
                delete $scope.searchMap.spec[key];
            }
            $scope.search();
        } else {
            alert("请先输入搜索条件");
        }

    };

});