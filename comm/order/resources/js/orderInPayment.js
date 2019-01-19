commApp.controller('orderInPaymentController', function ($scope, $state, $http, $filter, $timeout, $sce, $compile) {
    //mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.orderId = common.getUrlParam('orderId');

        var InterValObj;    //timer变量，控制时间
        var count = 5;      //间隔函数，1秒执行
        var curCount;       //当前剩余秒
        curCount = count;

        $scope.curCount = curCount;

        $scope.InterValObj = window.setInterval(function () {

            if (curCount === 0) {
                window.clearInterval($scope.InterValObj);//停止计时器

            } else if(curCount === 1) {
                $scope.go();

            }else{
                curCount--;
                $scope.curCount = curCount;
                $scope.$applyAsync();

            }

        }, 1000);

        runCircle(
            {
                obj:'canvasThree',
                percent:1,
                url:'resources/images/zstart.png',   //飞机小图地址
                imgWidth:30,
                imgHeight:30,
                circleBottomColor:"#e6eaed",//圆环底色
                outerColorStart:'#ebf7ff',  //外部圆环 渐变色
                outerColorMid:'#d8eefc',
                outerColorEnd:'#a7cee7',
                innerColorStart:'#6fbef0',  //内部圆环 渐变色
                innerColorEnd:'#058ee4'
            }
        );

    };

    $scope.go = function () {
        console.log('前往支付完成页面');
        window.location.href = '../order/orderTips.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&orderId=' + $scope.orderId;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    /*******************************************************逻辑-end***********************************************************/

});