app.controller('searchController', function ($scope, $location, searchService) {
    //搜索
    $scope.search = function () {
        if ($scope.searchMap.keywords != "") {
            $scope.searchMap.pageNum = 1;
            searchService.search($scope.searchMap).success(function (response) {
                $scope.resultMap = response;

            });
        } else {
            alert("请先输入搜索条件");
        }


    };
    //定义搜索项
    $scope.searchMap = {
        keywords: "",
        category: "",
        brand: "",
        spec: {},
        price: "",
        pageNum: 1,
        pageSize: 20,
        sortField: '',
        sort: ''
    };
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

    //自动加载分页
    $scope.searchpage = function () {
        if ($scope.searchMap.pageNum < $scope.resultMap.totalPages) {
            $scope.searchMap.pageNum++;
            searchService.search($scope.searchMap).success(function (response) {
                $scope.resultMap.rows = $scope.resultMap.rows.concat(response.rows);

            });
        }

    };

    //设置排序规则
    $scope.sortSearch = function (sortField, sort) {
        $scope.searchMap.sortField = sortField;
        $scope.searchMap.sort = sort;
        $scope.search();

    };

    //样式处理
    $scope.activeClass = ["active", "", "", "", "", ""];
    $scope.setActiveClass = function (index) {
        $scope.activeClass = ["", "", "", "", "", ""];
        $scope.activeClass[index] = "active";

    };

    //隐藏品牌列表
    $scope.keywordsIsBrand = function () {
        for (var i = 0; i < $scope.resultMap.brandList.length; i++) {
            if ($scope.searchMap.keywords.indexOf($scope.resultMap.brandList[i].text) >= 0) {
                return true;
            }
        }
        return false;

    };

    //与首页对接
    $scope.loadKeywords = function () {
        $scope.searchMap.keywords = $location.search()["keywords"];
        $scope.search();

    };

});