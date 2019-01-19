commApp.controller('firmOrderController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {

        new Ripple({
            opacity : 0.6,  //水波纹透明度
            speed : 1,      //水波纹扩散速度
            bgColor : "#fff", //水波纹颜色
            cursor : true  //是否显示手型指针
        });

        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.orderId = common.getUrlParam('orderId');
        $scope.debug = common.getUrlParam('debug');//等于1不用付钱直接跳完成页面
        $scope.vConsole = new VConsole();

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

    //初始化订单信息
    $scope.initOrder = function () {
        $.ajax({
            async: false,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/consultOrder',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                orderId:$scope.orderId,
                type:1
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取订单异常');
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;
                $scope.orderId = data.orderId;                      //订单id
                $scope.patientId = data.patientId;                  //患者id
                $scope.patientPlatformKey = data.patientPlatformKey;//患者平台key
                $scope.patientName = data.patientName;              //患者姓名
                $scope.doctorId = data.doctorId;                    //医生id
                $scope.doctorPlatformKey = data.doctorPlatformKey;  //医生平台key
                $scope.doctorName = data.doctorName;                //医生姓名
                $scope.content = data.contentFirst;                 //媒体资料
                $scope.remainTime = data.remainTime;                //预计回复时间
                $scope.outTradeNo = data.outTradeNo;                //商户订单号
                $scope.totalFee = data.totalFee;                    //金额
                $scope.contentArr = [];                             //文字容器
                $scope.imgArr = [];                                 //图片容器

                for(var i=0;i<($scope.content).length;i++){
                    var arr = ($scope.content)[i];
                    var cont = arr.cont;
                    var contType = arr.contType;
                    switch (contType) {
                        case 1:
                            $scope.contentArr.push(cont);
                            break;
                        case 2:
                            $scope.imgArr.push(cont);
                            break;
                    }
                }

                $scope.contentRes = ($scope.contentArr)[0];         //文字最终结果

                mui.hideLoading();
            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();
            }
        });
    };

    //判断订单状态
    $scope.judgeOrder = function () {
        $.ajax({
            async: false,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/consultOrderQuery',
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
                $scope.payBackStatus = data.payBackStatus;  //支付状态0未支付(未支付回调)1已支付2支付失败
                $scope.payErrorMsg = data.payErrorMsg;      //支付失败原因

                switch ($scope.payBackStatus) {
                    //0未支付
                    case 0:

                        break;
                    //1已支付
                    case 1:
                        window.location.href = '../personal/personal.html?account=' + $scope.account + '&openId=' + $scope.openId;
                        break;
                    //2支付失败
                    case 2:

                        break;
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();
            }
        });
    };

    //初始化微信SDK
    $scope.initSDK = function () {
        $.ajax({
            async: false,
            method: 'post',
            url:'/wxPayH5Api/createOrder',
            data:{
                openId:$scope.openId,
                orderNo:$scope.outTradeNo,
                body:'健康咨询',
                totalFee:'0.01'//$scope.totalFee
            },
            success:function (Data) {
                var message = (JSON.parse(Data)).message;
                if(message === '该订单已支付'){
                    mui.toast('该订单已支付');
                    setTimeout(function () {
                        window.location.href = '../order/orderTips.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId +
                            '&outTradeNo=' + $scope.outTradeNo;//商户订单号
                    }, 1500);
                    return false;
                }

                var data = (JSON.parse(Data)).data;
                $scope.appId = data.appId;
                $scope.nonceStr = data.nonceStr;
                $scope.packageValue = data.packageValue;
                $scope.paySign = data.paySign;
                $scope.signType = data.signType;
                $scope.timeStamp = data.timeStamp;
            },
            error:function (err) {
                mui.toast('获取SDK异常');
            }
        });
    };

    //初始化图片插件
    $scope.initImg = function () {
        mui.previewImage();
    };

    /** 付款
     * https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_7&index=6
     */
    $scope.pay = function () {

        if($scope.debug === '1'){
            window.location.href = '../order/orderInPayment.html' +
                '?account=' + $scope.account +
                '&openId=' + $scope.openId +
                '&outTradeNo=' + $scope.outTradeNo;//商户订单号
        }

        function onBridgeReady(){
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                    "appId":$scope.appId,           //公众号名称，由商户传入
                    "timeStamp":$scope.timeStamp,   //时间戳，自1970年以来的秒数
                    "nonceStr":$scope.nonceStr,     //随机串
                    "package":$scope.packageValue,
                    "signType":$scope.signType,     //微信签名方式
                    "paySign": $scope.paySign       //微信签名
                },

                function(res){
                    console.log(res);
                    if(res.err_msg == "get_brand_wcpay_request:ok"){
                        //使用以上方式判断前端返回,微信团队郑重提示：
                        //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                        window.location.href = '../order/orderInPayment.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId +
                            '&orderId=' + $scope.orderId;

                    }
                });
        }

        if (typeof WeixinJSBridge == "undefined"){
            if(document.addEventListener){
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            }else if (document.attachEvent){
                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
            }
        }else{
            onBridgeReady();
        }

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //初始化订单信息
    $scope.initOrder();

    //判断订单状态
    $scope.judgeOrder();

    //初始化微信SDK
    $scope.initSDK();

    //初始化图片插件
    $scope.initImg();

    /*******************************************************逻辑-end***********************************************************/

});