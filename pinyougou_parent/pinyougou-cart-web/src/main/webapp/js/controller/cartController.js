//首页控制器
app.controller('cartController', function ($scope, $location, cartService) {

    //查询购物车
    findCartList = function () {
        cartService.findCartList(cartService.getCartList()).success(function (response) {
            if (response.success) {
                $scope.cartList = response.data;
                if (response.loginName != '') {
                    //如果登录，清除本地购物车
                    cartService.removeCartList();
                }
            }
        });
    }

    //初始化
    $scope.init = function () {
        var itemId = $location.search()["itemId"];
        var num = $location.search()["num"];

        if (itemId != null && num != null) {
            $scope.addGoodsToCartList(itemId, num);
        } else {
            // $scope.cartList = cartService.getCartList();
            findCartList();
        }
    };

    //添加商品到购物车
    $scope.addGoodsToCartList = function (itemId, num) {
        cartService.addGoodsToCartList(cartService.getCartList(), itemId, num).success(function (response) {
            if (response.success) {
                $scope.cartList = response.data;
                if (response.loginName == "") {
                    //未登录，保存购物车到本地
                    cartService.saveCartList(response.data);
                } else {
                    //登录后，合并后清空本地
                    findCartList();
                }

            } else {
                alert(response.data);
            }

        });

    };

    //合计
    $scope.$watch("cartList", function (newValue, oldValue) {
        $scope.totalValue = cartService.sum(newValue);

    });
});