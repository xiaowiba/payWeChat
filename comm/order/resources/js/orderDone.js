commApp.controller('orderDoneController', function ($scope, $state, $http, $filter, $timeout, $sce, $compile) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.outTradeNo = common.getUrlParam('outTradeNo');

        $.ajax({
            async: false,
            method: 'get',
            url:'/wxPayH5Api/payIndex',
            data:{
                account:$scope.account,
                openId:$scope.openId
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取患者异常');
                    mui.hideLoading();
                    return false;
                }

                var data = (JSON.parse(Data)).data;

                //微信openID
                $scope.openId = data.openId;

                //病人id
                $scope.patientId = data.patientId;

                //接口平台url
                $scope.addaUrl = data.addaUrl;

                //key
                $scope.patientPlatformKey = data.accessKey;

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取患者异常');
                mui.hideLoading();
            }
        });

    };

    //获取订单信息
    $scope.initOrder = function () {
        $.ajax({
            async: false,
            method: 'post',
            url: $scope.addaUrl + '',
            data:{
                orderId:$scope.orderId
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取订单异常');
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();
            }
        });
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取订单信息
    $scope.initOrder();

    /*******************************************************逻辑-end***********************************************************/

});