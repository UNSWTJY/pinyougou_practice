//控制层
app.controller('userController', function ($scope, userService) {

    //注册
    $scope.reg = function () {
        //非空判断
        if ($scope.password == null || $scope.entity.password == null) {
            alert("密码输入不能为空");
            return;
        }
        //判断两次密码是否相同
        if ($scope.password != $scope.entity.password) {
            alert("两次输入的密码不同");
            return;
        }
        //注册
        userService.add($scope.entity,$scope.smsCode).success(
            function (response) {
                alert(response.message);
            }
        );
    };

    //发送验证码
    $scope.sendCode = function () {
        if ($scope.entity.phone == null) {
            alert("请输入手机号");
            return;
        }
        userService.sendCode($scope.entity.phone).success(function (response) {
            alert(response.message);

        });

    };

});	
