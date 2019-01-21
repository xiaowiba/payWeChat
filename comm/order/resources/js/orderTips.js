commApp.controller('orderTipsController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.orderId = common.getUrlParam('orderId');
        $scope.moreQu = common.getUrlParam('moreQu') ? common.getUrlParam('moreQu') : null;
        $scope.moreQu = parseInt($scope.moreQu);

        $scope.numState = true;//金额展示状态
        $scope.scheduleState = true;//进度展示状态
        $scope.successTipsLogo = $('.success-tips-logo');

        //$scope.vConsole = new VConsole();

        $.ajax({
            async: false,
            method: 'get',
            url:'../personal/resources/json/payIndex.json',
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

                var data = Data.data;

                //微信openID
                $scope.openId = data.openId;

                //病人id
                $scope.patientId = data.patientId;

                //接口平台url
                $scope.addaUrl = data.addaUrl;

                //key
                $scope.patientPlatformKey = data.accessKey;

                //获取订单信息
                $scope.initOrder();

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
            url: '../order/resources/json/consultOrderQuery.json',
            data:{
                orderId:$scope.orderId
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取订单异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result !== 200){
                    //mui.toast('获取订单异常');
                    $scope.numState = false;//金额展示状态
                    $scope.scheduleState = false;//进度展示状态
                    $scope.font = '订单不存在';
                    ($scope.successTipsLogo).removeClass('success-tips-logo-consult').addClass('fail-tips-logo-consult');
                    //初始化样式
                    $scope.initCss();
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;
                $scope.payBackStatus = data.payBackStatus;//支付状态0未支付(未支付回调)1已支付2支付失败
                $scope.payErrorMsg = data.payErrorMsg;//支付失败原因
                var title = $('#title');

                switch ($scope.payBackStatus) {
                    //0未支付
                    case 0:
                        title.html('未支付');
                        $scope.numState = true;//金额展示状态
                        $scope.scheduleState = false;//进度展示状态
                        $scope.font = '未支付';
                        $scope.num = '￥50.00';
                        ($scope.successTipsLogo).removeClass('success-tips-logo-consult').addClass('fail-tips-logo-consult');
                        break;
                    //1已支付
                    case 1:
                        title.html('支付成功');
                        $scope.numState = true;//金额展示状态
                        $scope.scheduleState = true;//进度展示状态
                        $scope.font = '支付成功';
                        $scope.num = '￥50.00';

                        //对追问的特殊处理
                        if($scope.moreQu === 1){
                            title.html('追问成功');
                            $scope.numState = false;//金额展示状态
                            $scope.font = '追问成功';

                            var html1 = '<span>医生稍后就会看到，并回复。</span>';
                            $('#moreContent').html(html1).css('line-height', '60px');

                            var html2 = '医生回复后，会立即通知你，请留意<br>微信通知。问诊进度请在';
                            $('#moreContentReply').html(html2);

                            ($scope.successTipsLogo).removeClass('success-tips-logo-consult').addClass('questioning-tips-logo-consult');
                        }

                        break;
                    //2支付失败
                    case 2:
                        title.html('支付失败');
                        $scope.numState = true;//金额展示状态
                        $scope.scheduleState = false;//进度展示状态
                        $scope.font = '支付失败';
                        $scope.num = '￥50.00';
                        ($scope.successTipsLogo).removeClass('success-tips-logo-consult').addClass('fail-tips-logo-consult');

                        //对追问的特殊处理
                        if($scope.moreQu === 1){
                            title.html('追问失败');
                            $scope.numState = false;//金额展示状态
                            $scope.scheduleState = false;//进度展示状态
                            $scope.font = '追问失败';
                            ($scope.successTipsLogo).removeClass('success-tips-logo-consult').addClass('questioning-tips-logo-consult');
                        }

                        break;
                }

                //初始化样式
                $scope.initCss();

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();
            }
        });
    };

    //初始化样式
    $scope.initCss = function () {
        var scheduleContentLabel = $('.schedule-content-label');
        var scheduleContentLabelWidth = scheduleContentLabel.innerWidth();

        var spanWidth = scheduleContentLabelWidth/2 + 'px';
        $('.schedule-content-top').css('background-position', spanWidth + ' bottom');
        $('.schedule-content-center').css('background-position', spanWidth + ' ');
        $('.schedule-content-bottom').css('background-position', spanWidth + ' top');
    };

    $scope.go = function (val) {
        window.location.href = val + '.html?account=' + $scope.account + '&openId=' + $scope.openId;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取订单信息
    //$scope.initOrder();

    //初始化样式
    //$scope.initCss();

    /*******************************************************逻辑-end***********************************************************/

});