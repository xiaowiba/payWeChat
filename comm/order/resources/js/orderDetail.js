commApp.controller('orderDetailController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {

        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');

        $scope.orderID = common.getUrlParam('orderID');
        $scope.type = common.getUrlParam('type');
        $scope.contentType = common.getUrlParam('contentType');
        $scope.orderID = parseInt($scope.orderID);
        $scope.type = parseInt($scope.type);
        $scope.contentType = parseInt($scope.contentType);

        //带时间对应的图片结果集
        //需要放到最外面
        $scope.upImgContainer = [];

        $scope.content = '病情描述';
        $scope.detailContentTitle = '问诊内容';
        $scope.payMethod = '微信支付';
        $scope.dataImg = [
            'http://images.xiaowiba.com/18-12-3/92732603.jpg',
            'http://images.xiaowiba.com/18-12-3/41625047.jpg',
            'http://images.xiaowiba.com/18-12-3/52619075.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg'
        ];

        //流程表
        $scope.orderSchedule = true;
        //预计回复时间
        $scope.orderRemainTime = true;
        //输入退款原因的状态
        $scope.reasonState = false;
        //关闭状态的订单头先默认不显示
        $scope.orderClose = false;
        //关闭状态的订单头标题
        $scope.closeTitle = '';
        //退款状态的原因显示
        $scope.orderCloseDiv = false;

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

    //获取订单详情
    $scope.getOrder = function () {
        $.ajax({
            async: false,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/consultOrder',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                orderId:$scope.orderID,
                type:$scope.type,
                contentType:$scope.contentType
            },
            success:function (Data) {
                mui.hideLoading();

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取订单异常');

                    setTimeout(function () {
                        window.location.href = '../personal/personal.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId;
                    }, 500);

                    return false;
                }

                if(Data.result === 200){

                    var data = (Data.data);
                    $scope.orderId = data.orderId;                      //订单id
                    $scope.patientId = data.patientId;                  //患者id
                    $scope.patientPlatformKey = data.patientPlatformKey;//患者平台key
                    $scope.patientName = data.patientName;              //患者姓名
                    $scope.doctorId = data.doctorId;                    //医生id
                    $scope.doctorPlatformKey = data.doctorPlatformKey;  //医生平台key
                    $scope.doctorName = data.doctorName;                //医生姓名
                    //var content = data.contentFirst;                  //媒体资料
                    $scope.contentFirst = data.contentFirst;            //
                    $scope.contentFirstReply = data.contentFirstReply;  //
                    $scope.contentMore = data.contentMore;              //
                    $scope.contentMoreReply = data.contentMoreReply;    //
                    $scope.remainTime = data.remainTime;                //预计回复时间
                    $scope.remainTime = ($scope.remainTime).substring(0, 12);
                    $scope.outTradeNo = data.outTradeNo;                //商户订单号
                    $scope.totalFee = data.totalFee;                    //金额
                    $scope.addTime = data.addTime;                      //创建时间
                    $scope.state = data.state;                          //订单状态
                    $scope.payTime = data.payTime;                      //支付时间
                    $scope.scheduleTime1 = data.scheduleTime1;          //问诊进度时间1
                    $scope.scheduleTime2 = data.scheduleTime2;          //问诊进度时间2
                    $scope.scheduleTime3 = data.scheduleTime3;          //问诊进度时间3
                    $scope.type = data.type;                            //订单类型:0全部1待付款2待回复3已完成4已关闭5待查看6退款中
                    $scope.contentType = data.contentType;              //回复状态:1正常无回复2正常有回复3追问无回复4追问有回复5正常待查看6追问待查看7超时关闭8退款关闭9退款中
                    $scope.closeReson = data.closeReson;                //关闭原因
                    $scope.firstTime = data.firstTime;                  //首次问诊时间
                    $scope.replyTime = data.replyTime;                  //首次回复时间
                    $scope.moreTime = data.moreTime;                    //追问时间
                    $scope.replyMoreTime = data.replyMoreTime;          //回复追问时间
                    //$scope.upImgContainer = [];                       //图片容器在最外面已经声明了

                    //对三种时间的判断
                    if(data.scheduleTime1 !== ''){
                        $('#scheduleLabel1').removeClass('schedule-content-label-false');
                        $('#scheduleLabel1').addClass('schedule-content-label-true');
                        $('#scheduleContent1').addClass('schedule-content-item-label-true');
                    }

                    if(data.scheduleTime2 !== ''){
                        $('#scheduleLabel2').removeClass('schedule-content-label-false');
                        $('#scheduleLabel2').addClass('schedule-content-label-true');
                        $('#scheduleContent2').addClass('schedule-content-item-label-true');
                    }

                    if(data.scheduleTime3 !== ''){
                        $('#scheduleLabel3').removeClass('schedule-content-label-false');
                        $('#scheduleLabel3').addClass('schedule-content-label-true');
                        $('#scheduleContent3').addClass('schedule-content-item-label-true');
                    }

                    //申请退款容器
                    var orderDetailButton = $('.order-detail-button');

                    //对退款的判断
                    //订单类型0全部1待付款2待回复3已完成4已关闭5待查看6退款中
                    switch ($scope.type) {
                        //不存在
                        case 0:
                            break;
                        //不存在
                        case 1:
                            break;
                        //待回复
                        case 2:
                            orderDetailButton.hide();
                            break;
                        //已完成
                        case 3:
                            orderDetailButton.hide();
                            break;
                        //已关闭
                        case 4:
                            orderDetailButton.hide();
                            break;
                        //待查看
                        case 5:
                            orderDetailButton.show();
                            break;
                        //退款中
                        case 6:
                            orderDetailButton.hide();
                            break;
                    }

                    //对各种状态的判断
                    //回复状态:1正常无回复2正常有回复3追问无回复4追问有回复5正常待查看6追问待查看7超时关闭8退款关闭9退款中
                    switch ($scope.contentType) {
                        //正常无回复
                        case 1:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = true;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //正常有回复
                        case 2:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            orderDetailButton.hide();
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = false;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //追问无回复
                        case 3:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '追问内容';
                            $scope.payMethod = '';
                            $scope.totalFee = 0;
                            orderDetailButton.hide();
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = true;

                            //对提问的判断
                            for(var i=0;i<$scope.contentMore.length;i++){
                                var arr = $scope.contentMore[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //追问有回复
                        case 4:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '追问内容';
                            $scope.payMethod = '';
                            $scope.totalFee = 0;
                            orderDetailButton.hide();
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = false;

                            //对提问的判断
                            for(var i=0;i<$scope.contentMore.length;i++){
                                var arr = $scope.contentMore[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //正常待查看
                        case 5:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            orderDetailButton.show();
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = true;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //追问待查看
                        case 6:
                            $scope.orderClose = false;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '';
                            $scope.detailContentTitle = '追问内容';
                            $scope.payMethod = '';
                            $scope.totalFee = 0;
                            orderDetailButton.hide();
                            $scope.orderSchedule = true;
                            $scope.orderRemainTime = true;

                            //对提问的判断
                            for(var i=0;i<$scope.contentMore.length;i++){
                                var arr = $scope.contentMore[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //超时关闭
                        case 7:
                            $scope.orderClose = true;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '订单超时关闭';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            $scope.closeReson = '订单回复超时，系统自动关闭';
                            orderDetailButton.hide();
                            $scope.orderSchedule = false;
                            $scope.orderRemainTime = false;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //退款关闭
                        case 8:
                            $scope.orderClose = true;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '订单退款关闭';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            orderDetailButton.hide();
                            $scope.orderSchedule = false;
                            $scope.orderRemainTime = false;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }

                            break;
                        //退款中
                        case 9:
                            $scope.orderClose = true;
                            $scope.orderCloseDiv = false;
                            $scope.closeTitle = '订单退款关闭';
                            $scope.detailContentTitle = '问诊内容';
                            $scope.payMethod = '微信支付';
                            orderDetailButton.hide();
                            $scope.orderSchedule = false;
                            $scope.orderRemainTime = false;

                            //对提问的判断
                            for(var i=0;i<$scope.contentFirst.length;i++){
                                var arr = $scope.contentFirst[i];
                                var contType = arr.contType;//类型(1文字2图片3语音4视频)
                                var cont = arr.cont;

                                switch (contType) {
                                    //文字
                                    case 1:
                                        $scope.content = cont;
                                        break;
                                    //图片
                                    case 2:
                                        ($scope.upImgContainer).push({
                                            date:i,
                                            src:cont
                                        });
                                        break;
                                    case 3:
                                        break;
                                    case 4:
                                        break;
                                }
                            }
                            break;
                    }


                }else{
                    mui.toast('获取订单异常');

                    setTimeout(function () {
                        window.location.href = '../personal/personal.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId;
                    }, 500);

                }

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();

                setTimeout(function () {
                    window.location.href = '../personal/personal.html' +
                        '?account=' + $scope.account +
                        '&openId=' + $scope.openId;
                }, 500);
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

        //没起作用？
        $scope.orderDetailImg = $('.order-detail-img');
        $scope.orderDetailImgWidth = ((($scope.orderDetailImg).innerWidth())-20)/4 + 'px';

        $('.order-img-item').css('width', $scope.orderDetailImgWidth).css('height', $scope.orderDetailImgWidth);

        $scope.$applyAsync();

    };

    //初始化图片插件
    $scope.initImg = function () {
        mui.previewImage();
    };

    //去查看回复页面
    $scope.goSee = function () {
        //回复状态：1正常无回复 2正常有回复 3追问无回复 4追问有回复 5正常待查看 6追问待查看
        //好乱，得再整理一下
        if($scope.contentType === 1 || $scope.contentType === 3 || $scope.contentType === 5 || $scope.contentType === 6){
            mui.toast('医生还未回复');
        }else{
            window.location.href = '../reply/reply.html' +
                '?account=' + $scope.account +
                '&openId=' + $scope.openId +
                '&orderId=' + $scope.orderId +
                '&type=' + $scope.type;
        }
    };

    $scope.showReason = function () {
        $('#reason').val('');
        $scope.reasonState = true;
        ModalHelper.afterOpen();
        $scope.$applyAsync();
    };

    $scope.cancel = function () {
        $('#reason').val('');
        $scope.reasonState = false;
        ModalHelper.beforeClose();
        $scope.$applyAsync();
    };

    $scope.submit = function () {
        var reason = $('#reason').val();

        if(reason === ''){
            mui.toast('请输入退款原因');
            return false;
        }

        mui.showLoading('正在加载..', 'div');

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/Refund',
            data:{
                orderId:$scope.orderId,
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                refundReson:reason
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('申请退款失败,请稍后重试');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){
                    mui.toast('申请退款成功');
                    $('.order-detail-button').hide();

                }else{
                    mui.toast('申请退款失败,请稍后重试');
                    $('#reason').val('');

                }

                $scope.reasonState = false;
                ModalHelper.beforeClose();
                $scope.$applyAsync();

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('申请退款失败,请稍后重试');
                mui.hideLoading();
            }
        });

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取订单详情
    $scope.getOrder();

    //初始化样式
    $scope.initCss();

    //初始化图片插件
    $scope.initImg();

    var ModalHelper = (function(bodyCls) {
        var scrollTop;
        return {
            afterOpen: function() {
                scrollTop = document.scrollingElement.scrollTop;
                document.body.classList.add(bodyCls);
                document.body.style.top = -scrollTop + 'px';
            },
            beforeClose: function() {
                document.body.classList.remove(bodyCls);
                document.scrollingElement.scrollTop = scrollTop;
            }
        };
    })('modal-open');

    /*******************************************************逻辑-end***********************************************************/

});