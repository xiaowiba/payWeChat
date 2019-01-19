commApp.controller('serviceController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    //mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {

        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');

        $.ajax({
            async: false,
            method: 'get',
            url:'/edemaH5Api/edemaIndex',
            data:{
                account:$scope.account,
                openId:$scope.openId
            },
            success:function (data) {
                $scope.data = (JSON.parse(data)).data;

                if($scope.data === null || $scope.data === undefined || $scope.data === ''){
                    window.location.reload();
                    // mui.toast('接口异常');
                    // mui.hideLoading();
                    // return false;
                }

                //微信openID
                $scope.openId = $scope.data.openId;

                //病人id
                $scope.patientId = $scope.data.patientId;

                //平台url
                $scope.platformUrl = $scope.data.platformUrl;

                mui.hideLoading();
            },
            error:function (err) {
                console.log(err);
                mui.toast('接口异常');
                mui.hideLoading();
            }
        });

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    /*******************************************************逻辑-end***********************************************************/

});