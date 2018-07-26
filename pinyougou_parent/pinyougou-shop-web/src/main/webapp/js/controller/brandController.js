app.controller('brandController', function ($scope, $controller, brandService) {
    //继承
    $controller('baseController', {$scope: $scope});
    //读取列表数据，未分页，绑定到表单中
    $scope.findAll = function () {
        brandService.findAll().success(function (response) {
            $scope.list = response;

        });

    };
    //分页查询品牌列表
    $scope.findPage = function (page, rows) {
        brandService.findPage(page, rows).success(function (response) {
            $scope.paginationConf.totalItems = response.total;
            $scope.list = response.rows;

        });
    };
    //添加和修改品牌信息
    $scope.save = function () {
        var object = null;
        if ($scope.entity.id != null) {
            object = brandService.update($scope.entity);
        } else {
            object = brandService.add($scope.entity);
        }
        object.success(function (response) {
            if (response.success) {
                $scope.reloadList();
            } else {
                alert(response.message);
            }

        });

    };
    //根据id查询品牌
    $scope.findOne = function (id) {
        brandService.findOne(id).success(function (response) {
            $scope.entity = response;

        });

    };
    //删除
    $scope.dele = function () {
        //获取数组
        brandService.dele($scope.selectIds).success(function (response) {
            if (response.success) {
                $scope.reloadList();
                $scope.selectIds = [];
            } else {
                alert(response.message);
            }

        });
    }
    //查询
    $scope.search = function (page, rows) {
        brandService.search(page, rows, $scope.searchEntity).success(function (response) {
            $scope.paginationConf.totalItems = response.total;
            $scope.list = response.rows;

        });

    };

});