app.controller('indexController', function ($scope, contentService) {

    //定义广告数组，存放所有广告，类型为索引
    $scope.contentList = [];

    $scope.findByCategoryId = function (categoryId) {
        contentService.findByCategoryId(categoryId).success(function (response) {
            $scope.contentList[categoryId] = response;

        });

    };

});