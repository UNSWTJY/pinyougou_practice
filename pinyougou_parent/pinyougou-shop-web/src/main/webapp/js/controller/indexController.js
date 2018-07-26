app.controller('indexController', function ($scope, loginService) {

    $scope.findLoginName = function () {
        loginService.findLoginName().success(function (response) {
            $scope.loginName = response.loginName;

        });

    };
});