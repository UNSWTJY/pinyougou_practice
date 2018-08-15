//服务层
app.service('cartService', function ($http) {

    //读取本地购物车数据
    this.getCartList = function () {
        var cartList = localStorage.getItem("cartList");
        if (cartList == null || cartList == '') {
            return [];
        } else {
            return JSON.parse(cartList);
        }

    };

    //保存本地购物车数据
    this.saveCartList = function (cartList) {
        localStorage.setItem("cartList", JSON.stringify(cartList));

    };

    //移除本地购物车
    this.removeCartList = function () {
        localStorage.removeItem("cartList");

    };

    //添加商品到购物车
    this.addGoodsToCartList = function (cartList, itemId, num) {
        return $http.post('cart/addGoodsToCartList.do?itemId=' + itemId + '&num=' + num, cartList);
    };

    //数量，金额求和
    this.sum = function (cartList) {
        var totalValue = {totalNum: 0, totalMoney: 0.0};
        for (var i = 0; i < cartList.length; i++) {
            var cart = cartList[i];
            for (var j = 0; j < cart.orderItemList.length; j++) {
                var orderItem = orderItemList[j];
                totalValue.totalNum += orderItem.num;
                totalValue.totalMoney += orderItem.totalFee;
            }
        }
        return totalValue;

    };

    //查询购物车
    this.findCartList = function (cartList) {
        return $http.post('cart/findCartList.do',cartList);

    };
});