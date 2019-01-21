commApp.controller('consultController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        //http://mdruby.natapp4.cc/views/H5/comm/consult/consult.html
        // ?account=gh_02ff1d3275f0
        // &openId=oTcawv3SIFf9MGgsMnm1hPdoD8vM
        // &doctorId=4345
        // &doctorName=%E7%8E%8B%E8%B6%85
        // &doctorPlatformKey=42b891cd
        // &price=0
        // &moreQu=0
        /**************************************问的逻辑-start******************************************/
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.doctorId = common.getUrlParam('doctorId') ? common.getUrlParam('doctorId') : '';
        $scope.doctorName = common.getUrlParam('doctorName') ? common.getUrlParam('doctorName') : '';
        $scope.doctorPlatformKey = common.getUrlParam('doctorPlatformKey') ? common.getUrlParam('doctorPlatformKey') : '';
        $scope.moreQu = common.getUrlParam('moreQu') ? common.getUrlParam('moreQu') : 0;//是否追问0：正常问；1：追问
        $scope.moreQu = parseInt($scope.moreQu);
        $scope.price = common.getUrlParam('price') ? common.getUrlParam('price') : 0;

        $scope.documentWidth = $(document).width();

        $scope.vConsole = new VConsole();

        //微信语音SDK容器
        $scope.voice = {
            localId: '',
            serverId: ''
        };

        //带时间对应的图片结果集
        //需要放到最外面
        $scope.upImgContainer = [];

        new Ripple({
            opacity : 0.6,  //水波纹透明度
            speed : .5,      //水波纹扩散速度
            bgColor : "#fff", //水波纹颜色
            cursor : true  //是否显示手型指针
        });

        //语音内容容器
        $scope.content = '';

        //图片容器
        $scope.Img = [];

        $scope.nLength = ($scope.content).length;
        if($scope.nLength < 10){
            $('#nLength').addClass('red');
        }else{
            $('#nLength').removeClass('red');
        }

        //语音识别弹出框状态
        $scope.voiceState = false;

        //第一次提问状态
        $scope.consultState = true;

        //第二次追问状态
        $scope.questionState = false;

        //是否追问0：正常问；1：追问
        if($scope.moreQu === '0' || $scope.moreQu === 0){
            $scope.consultState = true;
            $scope.questionState = false;
        }else{
            $scope.consultState = false;
            $scope.questionState = true;
        }

        //费用
        if($scope.questionState === true){
            $scope.num = '免费';
        }else{
            $scope.num = '￥ ' + $scope.price;
        }

        $scope.placeholder = '请描述就诊人的主要症状-病症持续时间-治疗经过-是否使用过药物-是否怀孕-是否有重大疾病史-过敏史-本次咨询病情主诉等。';

        /**************************************问的逻辑-end******************************************/

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

                mui.hideLoading();

                $scope.getDraft();
                return false;

                /**
                 * 再次编辑传 orderID
                 * 追问传    orderId   moreQu=1
                 */

                /**************************************再次编辑草稿的逻辑-start******************************************/
                $scope.orderID = common.getUrlParam('orderID') ? common.getUrlParam('orderID') : null;
                if($scope.orderID === null){
                    console.log('这也许是个新订单');
                }else{
                    console.log('这是个草稿');
                    //确认为再次编辑了
                    //获取再次编辑的详情
                    $scope.getDraft();
                }

                /**************************************再次编辑草稿的逻辑-end********************************************/

                /**************************************追问的逻辑-start*************************************************/
                $scope.orderId = common.getUrlParam('orderId') ? common.getUrlParam('orderId') : null;
                if($scope.moreQu === 1){
                    console.log('这确实是个追问订单');
                    $scope.placeholder = '基于上次问诊内容，请您详细描述追问内容';
                    //获取追问的详情
                    $scope.getMore();
                }else{
                    console.log('这不是个追问订单');
                }

                /**************************************追问的逻辑-end***************************************************/

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取患者异常');
                mui.hideLoading();
            }
        });

    };

    //获取再次编辑的详情
    $scope.getDraft = function () {
        console.log(111);
        mui.showLoading('正在加载..', 'div');
        $scope.orderID = parseInt($scope.orderID);

        $.ajax({
            async: true,
            method: 'post',
            url:'../consult/resources/json/consultOrder.json',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                orderId:$scope.orderID,
                type:1//订单类型0全部1待付款2待回复3已完成4已关闭5待查看6退款中
            },
            success:function (Data) {
                mui.hideLoading();

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取草稿异常');
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
                    var content = data.contentFirst;                    //媒体资料
                    $scope.remainTime = data.remainTime;                //预计回复时间
                    $scope.outTradeNo = data.outTradeNo;                //商户订单号
                    $scope.totalFee = data.totalFee;                    //金额
                    //$scope.upImgContainer = [];                       //图片容器在最外面已经声明了

                    for(var i=0;i<content.length;i++){
                        var arr = content[i];
                        var contType = arr.contType;//类型(1文字2图片3语音4视频)
                        var cont = arr.cont;

                        switch (contType) {
                            //文字
                            case 1:
                                $scope.content = cont;
                                $scope.nLength = ($scope.content).length;
                                if($scope.nLength < 10){
                                    $('#nLength').addClass('red');
                                }else{
                                    $('#nLength').removeClass('red');
                                }
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

                    //初始化再次编辑的图片
                    $scope.getImg();

                }else{
                    mui.toast('获取草稿异常');
                }

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取草稿异常');
                mui.hideLoading();
            }
        });
    };

    //获取追问的详情
    $scope.getMore = function () {
        mui.showLoading('正在加载..', 'div');
        $scope.orderId = parseInt($scope.orderId);

        $.ajax({
            async: true,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/consultOrder',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                orderId:$scope.orderId,
                type:3//订单类型0全部1待付款2待回复3已完成4已关闭5待查看6退款中
            },
            success:function (Data) {
                mui.hideLoading();

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取订单异常');
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
                    //var content = data.contentFirst;                    //媒体资料
                    //$scope.remainTime = data.remainTime;                //预计回复时间
                    //$scope.outTradeNo = data.outTradeNo;                //商户订单号
                    //$scope.totalFee = data.totalFee;                    //金额

                }else{
                    mui.toast('获取订单异常');
                }

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取订单异常');
                mui.hideLoading();
            }
        });
    };

    //初始化再次编辑的图片
    $scope.getImg = function () {
        var html = '';

        for(var i=0;i<($scope.upImgContainer).length;i++){
            var arr = ($scope.upImgContainer)[i];
            var date = arr.date;
            var src = arr.src;
            html += '<span class="up-section fl" data-date="' + date + '">' +
                '<span class="up-span"></span>' +
                '<img class="close-upimg" src="img/a7.png" />' +
                '<img class="up-img" src="' + src + '" />' +
                '<p class="img-name-p">1.jpg</p>' +
                '<input id="taglocation" name="taglocation" value="" type="hidden" />' +
                '<input id="tags" name="tags" value="" type="hidden" />' +
                '</span>';
        }

        $('.z_file').before(html);

        $scope.initCss();
    };

    //初始化样式
    $scope.initCss = function () {
        var voice = $('.voice-item');
        var voiceWidth = voice.innerWidth() + 'px';
        voice.css('padding-top', voiceWidth);

        $scope.consultImg = $('.consult-img');
        $scope.consultImgWidth = ((($scope.consultImg).innerWidth())-20)/4 + 'px';

        $('.upimg-div .up-section').css('width', $scope.consultImgWidth).css('height', $scope.consultImgWidth);
        $('.img-box .upimg-div .z_file').css('width', $scope.consultImgWidth).css('height', $scope.consultImgWidth);
        $('.z_file .add-img').css('width', $scope.consultImgWidth).css('height', $scope.consultImgWidth);
        $('.up-img').css('width', $scope.consultImgWidth).css('height', $scope.consultImgWidth);
        $('.z_photo .z_file').css('width', $scope.consultImgWidth).css('height', $scope.consultImgWidth);

        var upSection = $('.up-section');
        var upSectionLength = upSection.length;

        if(upSectionLength === 0 || upSectionLength === 4){
            $('.z_photo .z_file').css('margin-left', '2px');
        }else{
            $('.z_photo .z_file').css('margin-left', '-2px');
        }

        $scope.$applyAsync();

    };

    //初始化输入框,使其可以根据内容自适应高度
    $scope.textarea = function () {
        function makeExpandingArea(el) {
            var setStyle = function(el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
                // console.log(el.scrollHeight);
            };

            var delayedResize = function(el) {
                window.setTimeout(function() {
                        setStyle(el);
                    },
                    0);
            };

            if (el.addEventListener) {
                el.addEventListener('input',function() {
                    setStyle(el);
                },false);
                setStyle(el);
            } else if (el.attachEvent) {
                el.attachEvent('onpropertychange',function() {
                    setStyle(el);
                });
                setStyle(el);
            }
            if (window.VBArray && window.addEventListener) { //IE9
                el.attachEvent("onkeydown",function() {
                    var key = window.event.keyCode;
                    if (key == 8 || key == 46) delayedResize(el);

                });
                el.attachEvent("oncut",function() {
                    delayedResize(el);
                }); //处理粘贴
            }
        }

        makeExpandingArea(textarea);

    };

    //初始化微信SDK
    $scope.initSDK = function () {
        var url = window.location.href.split('#')[0];

        return false;

        $.ajax({
            async: false,
            method: 'post',
            url:'/wxapi/jsTicket',
            data:{
                url:url,
                account:$scope.account
            },
            success:function (Data) {
                mui.hideLoading();

                var data = (JSON.parse(Data)).data;

                wx.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: [
                        'translateVoice',
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'playVoice',
                        'onVoicePlayEnd',
                        'pauseVoice',
                        'stopVoice',
                        'uploadVoice',
                        'downloadVoice'
                    ]
                });

            },
            error:function (err) {
                mui.toast('获取语音接口异常');
                mui.hideLoading();
            }
        });
    };

    //初始化是否已读提示框
    $scope.initTips = function () {
        var btnArray = ['关闭', '不再提示'];

        $.ajax({
            async: true,
            method: 'post',
            url:'../consult/resources/json/consultPtNifyCheck.json',
            data:{
                patientPlatformKey:$scope.patientPlatformKey,
                patientId:$scope.patientId
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('已读异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){

                    var ignore = Data.data.ignore;//0提示；1不用提示

                    if(ignore === 0){
                        mui.confirm(
                            '1、咨询所产生的医师服务费为自费，不支持医保报销。\n' +
                            '\n' +
                            '2、危急重症、发热及传染患者请及时到医院就诊，以免延误最佳治疗时机。\n' +
                            '\n' +
                            '3、医生是利用空闲回复您的咨询，请耐心等待。\n' +
                            '\n' +
                            '4、医生未在48小时内回复，相关费用将原路退回。',
                            '',
                            btnArray,
                            function(e) {
                                if (e.index === 1) {

                                    //已读操作
                                    $scope.read();

                                }

                            });
                    }else{

                    }


                }else{
                    mui.toast('已读异常');
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('已读异常');
                mui.hideLoading();
            }
        });

    };

    //已读操作
    $scope.read = function () {
        mui.showLoading('正在加载..', 'div');

        mui.toast('测试操作');
        mui.hideLoading();
        return false;

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/consultPtNifySet',
            data:{
                patientPlatformKey:$scope.patientPlatformKey,
                patientId:$scope.patientId
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('已读异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){

                }else{
                    mui.toast('已读异常');
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('已读异常');
                mui.hideLoading();
            }
        });
    };

    //初始化草稿提示框
    $scope.initDraft = function () {
        var btnArray = ['否', '是'];

        $('.draft').on('tap', function() {
            setTimeout(function () {
                mui.confirm(
                    '存为草稿的咨询信息，请在个人中心-我的草稿中查看编辑。',
                    '是否存为草稿',
                    btnArray,
                    function(e) {
                    if (e.index === 1) {

                        var contentLength = ($scope.content).length;

                        if (contentLength < 10) {
                            mui.toast('请至少输入10个字符');
                        } else {
                            $scope.saveAs();

                        }

                    }

                });

            }, 200);

        });
    };

    //初始化确认咨询提示框
    $scope.initFiremOrder = function () {
        var btnArray = ['否', '是'];

        $('#consult').on('tap', function() {
            setTimeout(function () {

                mui.confirm(
                    '',
                    '是否确认咨询',
                    btnArray,
                    function(e) {
                        if (e.index === 1) {

                            var contentLength = ($scope.content).length;

                            if(contentLength < 10){
                                mui.toast('请至少输入10个字符');
                            }else{
                                //现在直接全传就可以了，不用先传图再传字了
                                $scope.submitAll();

                                //老逻辑，先传图后再传字，慢的一笔，弃之
                                /*if($scope.upImgArr.length < 1){
                                    //没有图片，直接提交
                                    $scope.submitAll();
                                }else{
                                    //有图片，先传图
                                    $scope.submitImg();
                                }*/
                            }

                        }

                });
            }, 200);

        });
    };

    //咨询的全部上传
    $scope.submitAll = function () {
        mui.showLoading('正在加载..', 'div');

        window.location.href = '../consult/firmOrder.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&orderId=' + $scope.orderId;

        return false;

        var contList = [];

        if(($scope.upImgContainer).length === 0){

        }else{
            for(var i=0;i<($scope.upImgContainer).length;i++){
                var arr = ($scope.upImgContainer)[i];
                var src = arr.src;
                contList.push({
                    contType: 2,
                    cont: src
                });
            }
        }

        /*if(($scope.Img).length === 0){

        }else{
            for(var i=0;i<($scope.Img).length;i++){
                var arr = ($scope.Img)[i];
                contList.push({
                    contType: 2,
                    cont: arr
                });
            }
        }*/

        contList.push({
            contType: 1,
            cont: $scope.content
        });

        var param = {
            patientId:$scope.patientId,
            patientPlatformKey:$scope.patientPlatformKey,
            doctorId:$scope.doctorId,
            doctorPlatformKey:$scope.doctorPlatformKey,
            draft:0,                //是否草稿0不是
            //orderId:0,              //0添加大于0编辑
            moreQu:0,               //0正常问
            //total_fee:$scope.price, //价格前端不传了，安全问题，改为后端自己查
            //媒体资料类型1文字2图片3语音4视频
            contList:contList
            /*[
                {
                    contType: 1,
                    cont: $scope.content
                },
                {
                    contType: 2,
                    cont: "http://www.ttttttttttttttttt.com"
                }
            ]*/
        };

        if($scope.orderID === null){
            param.orderId = 0;
        }else{
            //确认为再次编辑了
            //获取再次编辑的详情
            param.orderId = $scope.orderID;
        }

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/question',
            data: param,
            success:function (Data) {
                var data = Data.data;

                if(Data.result === 200){
                    $scope.orderId = data.orderId;

                    window.location.href = '../consult/firmOrder.html' +
                        '?account=' + $scope.account +
                        '&openId=' + $scope.openId +
                        '&orderId=' + $scope.orderId;

                }else{
                    mui.hideLoading();
                    mui.toast('提交异常');
                }

            },
            error:function (err) {
                mui.toast('提交异常');
                mui.hideLoading();
            }
        });
    };

    //存为草稿操作
    $scope.saveAs = function () {
        mui.toast('演示操作');
        mui.hideLoading();

        return false;

        var contList = [];

        if(($scope.upImgContainer).length === 0){

        }else{
            for(var i=0;i<($scope.upImgContainer).length;i++){
                var arr = ($scope.upImgContainer)[i];
                var src = arr.src;
                contList.push({
                    contType: 2,
                    cont: src
                });
            }
        }

        contList.push({
            contType: 1,
            cont: $scope.content
        });

        var param = {
            patientId:$scope.patientId,
            patientPlatformKey:$scope.patientPlatformKey,
            doctorId:$scope.doctorId,
            doctorPlatformKey:$scope.doctorPlatformKey,
            draft:1,                //是否草稿0不是
            //orderId:0,              //0添加大于0编辑
            //moreQu:0,               //0正常问
            //total_fee:$scope.price, //价格前端不传了，安全问题，改为后端自己查
            //媒体资料类型1文字2图片3语音4视频
            contList:contList
        };

        if($scope.orderID === null){
            param.orderId = 0;
        }else{
            //确认为再次编辑了
            //获取再次编辑的详情
            param.orderId = $scope.orderID;
        }

        $.ajax({
            async: false,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/question',
            data: param,
            success:function (Data) {
                var data = Data.data;

                if(Data.result === 200){
                    $scope.orderId = data.orderId;

                    window.location.href = '../personal/personal.html' +
                        '?account=' + $scope.account +
                        '&openId=' + $scope.openId;

                }else{
                    mui.hideLoading();
                    mui.toast('提交草稿异常');
                }

            },
            error:function (err) {
                mui.toast('提交草稿异常');
                mui.hideLoading();
            }
        });
    };

    //最后统一上传的图片接口，已弃之
    /*$scope.submitImg = function () {
        $scope.uploadImg = [];

        for(var i=0;i<($scope.upImgArr).length;i++){
            if($scope.upImgArr[i] !== undefined){
                $scope.uploadImg.push($scope.upImgArr[i]);
            }
        }

        //创建formData对象
        var fd = new FormData();

        for(var x=0;x<($scope.uploadImg).length;x++){
            fd.append('name', $scope.uploadImg[x], x + '.jpg');
        }

        $.ajax({
            async: false,
            method: 'post',
            processData : false,
            contentType: false,
            url: $scope.addaUrl + '/rest/consult/mediaFiles/wx/'  + $scope.patientId + '/' + $scope.patientPlatformKey,
            data: fd,
            success:function (data) {
                if(data.result === 200){
                    $scope.Img = data.data;

                    //提交数据
                    $scope.submitAll();

                }else{
                    mui.hideLoading();
                    mui.toast('图片上传异常');
                }

            },
            error:function (err) {
                mui.toast('图片上传异常');
                mui.hideLoading();
            }
        });
    };*/

    //点击就上传图片的接口
    $scope.submitImgTwo = function (base64, date) {
        mui.showLoading('正在加载..', 'div');

        var blob = $scope.toBlob(base64);
        var fd = new FormData();

        fd.append('name', blob, date + '.jpg');

        $.ajax({
            async: true,
            method: 'post',
            processData : false,
            contentType: false,
            url: $scope.addaUrl + '/rest/consult/mediaFiles/wx/'  + $scope.patientId + '/' + $scope.patientPlatformKey,
            data: fd,
            success:function (Data) {
                mui.hideLoading();

                var src = (Data.data)[0];
                for(var i=0;i<($scope.upImgContainer).length;i++){
                    var arr = ($scope.upImgContainer)[i];
                    var arrDate = arr.date;
                    if(date === arrDate){
                        ($scope.upImgContainer)[i].src = src;
                    }
                }

            },
            error:function (err) {
                mui.toast('图片上传异常');
                mui.hideLoading();
            }
        });
    };

    //计算文字数
    $scope.getNum = function () {
        var num = ($scope.content).length;

        $scope.nLength = num;

        if(num === 500){
            mui.toast('最多500字符');
        }

        if($scope.nLength < 10){
            $('#nLength').addClass('red');
        }else{
            $('#nLength').removeClass('red');
        }

    };

    //初始化追问
    $scope.questioning = function () {
        var btnArray = ['否', '是'];

        $('#questioning').on('tap', function() {
            setTimeout(function () {
                mui.confirm('', '是否确认追问', btnArray, function(e) {
                    if (e.index === 1) {

                        var contentLength = ($scope.content).length;

                        if (contentLength < 10) {
                            mui.toast('请至少输入10个字符');
                        } else {
                            $scope.submitMore();

                        }

                    }

                });

            }, 200);

        });

    };

    //提交追问
    $scope.submitMore = function () {
        mui.showLoading('正在加载..', 'div');
        var contList = [];

        if(($scope.upImgContainer).length === 0){

        }else{
            for(var i=0;i<($scope.upImgContainer).length;i++){
                var arr = ($scope.upImgContainer)[i];
                var src = arr.src;
                contList.push({
                    contType: 2,
                    cont: src
                });
            }
        }

        contList.push({
            contType: 1,
            cont: $scope.content
        });

        var param = {
            orderId:$scope.orderId,
            patientId:$scope.patientId,
            patientPlatformKey:$scope.patientPlatformKey,
            doctorId:$scope.doctorId,
            doctorPlatformKey:$scope.doctorPlatformKey,
            draft:0,                //是否草稿0不是
            //orderId:0,              //0添加大于0编辑
            moreQu:1,               //0正常问1追问
            //total_fee:$scope.price, //价格前端不传了，安全问题，改为后端自己查
            //媒体资料类型1文字2图片3语音4视频
            contList:contList
            /*[
                {
                    contType: 1,
                    cont: $scope.content
                },
                {
                    contType: 2,
                    cont: "http://www.ttttttttttttttttt.com"
                }
            ]*/
        };

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/question',
            data: param,
            success:function (Data) {
                var data = Data.data;

                if(Data.result === 200){
                    $scope.orderId = data.orderId;

                    window.location.href = '../order/orderTips.html' +
                        '?account=' + $scope.account +
                        '&openId=' + $scope.openId +
                        '&orderId=' + $scope.orderId +
                        '&moreQu=1';

                }else{
                    mui.hideLoading();
                    mui.toast('提交异常');
                }

            },
            error:function (err) {
                mui.toast('提交异常');
                mui.hideLoading();
            }
        });
    };

    //初始化上传
    $scope.imgUp = function () {
        var delParent;
        var defaults = {
            fileType : ["jpg","png","bmp","jpeg"],  // 上传文件的类型
            fileSize : 1024 * 1024 * 5              // 上传文件的大小 5M
        };

        //图片结果集
        var upImgArr = [];
        $scope.upImgArr = [];

        //图片base64结果集
        var upImgBaseArr = [];
        $scope.upImgBaseArr = [];

        //带时间对应的图片结果集
        //需要放到最外面
        //$scope.upImgContainer = [];

        /*点击图片的文本框*/
        $(".file").change(function(){
            var idFile = $(this).attr("id");
            var file = document.getElementById(idFile);

            //存放图片的父亲元素
            var imgContainer = $(this).parents(".z_photo");

            //获取的图片文件
            var fileList = file.files;

            //遍历得到的图片文件
            var numUp = imgContainer.find(".up-section").length;

            //总的数量
            var totalNum = numUp + fileList.length;

            if(fileList.length > 1 || totalNum > 8){
                //一次选择上传超过4个 或者是已经上传和这次上传的到的总数也不可以超过4个
                //mui.toast("上传图片数目不可以超过4个，请重新选择");
                mui.toast("一次只能添加一张照片");
            } else if (numUp < 8){
                var date = new Date().getTime();

                fileList = validateUp(fileList);

                fileList[0].date = date;

                /**************************************************************************************************/
                // 压缩图片需要的一些元素和对象
                var reader = new FileReader();
                var img = new Image();

                // 缩放图片需要的canvas
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                //图片类型,其实用不到
                var fileType = fileList[0].type;

                reader.readAsDataURL(fileList[0]);

                reader.onload = function(e) {
                    //e.target.result就是图片的base64地址信息
                    img.src = e.target.result;
                };

                img.onload = function() {
                    // 图片原始尺寸
                    var originWidth = img.width;
                    var originHeight = img.height;

                    // 最大尺寸限制
                    var maxWidth = 400;
                    var maxHeight = 400;

                    // 目标尺寸
                    var targetWidth = originWidth;
                    var targetHeight = originHeight;

                    // 图片尺寸超过400x400的限制
                    if (originWidth > maxWidth || originHeight > maxHeight) {
                        if (originWidth / originHeight > maxWidth / maxHeight) {
                            // 更宽，按照宽度限定尺寸
                            targetWidth = maxWidth;
                            targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                        } else {
                            targetHeight = maxHeight;
                            targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                        }
                    }

                    // canvas对图片进行缩放
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    // 清除画布
                    context.clearRect(0, 0, targetWidth, targetHeight);

                    // 图片压缩
                    context.drawImage(img, 0, 0, targetWidth, targetHeight);

                    var blob = canvas.toDataURL('image/jpeg', 0.5);

                    upImgBaseArr.push(blob);
                    $scope.upImgBaseArr = upImgBaseArr;

                    /******************点击就上传-start*****************/
                    $scope.upImgContainer.push({
                        date:date,
                        base64:blob
                    });
                    $scope.submitImgTwo(blob, date);
                    /******************点击就上传-end*****************/

                    var blobs = $scope.toBlob(blob);

                    blobs.date = date;

                    //将图片放入缓存中
                    upImgArr.push(blobs);
                    $scope.upImgArr = upImgArr;

                    var $section = $("<span class='up-section fl loading ' data-date='" + date + "'>");
                    imgContainer.prepend($section);

                    var $span = $("<span class='up-span'>");
                    $span.appendTo($section);

                    var $img0 = $("<img class='close-upimg'>").on("click",function(event){
                        event.preventDefault();
                        event.stopPropagation();
                        $(".works-mask").show();
                        delParent = $(this).parent();
                    });

                    $img0.attr("src","img/a7.png").appendTo($section);

                    var $img = $("<img class='up-img up-opcity'>");
                    $img.css("background",'url(' + blob + ')').css('background-size', 'cover');
                    $img.appendTo($section);

                    var $p = $("<p class='img-name-p'>");
                    $p.html(fileList[0].name).appendTo($section);

                    var $input = $("<input id='taglocation' name='taglocation' value='' type='hidden' />");
                    $input.appendTo($section);

                    var $input2 = $("<input id='tags' name='tags' value='' type='hidden' />");
                    $input2.appendTo($section);

                    setTimeout(function(){
                        $(".up-section").removeClass("loading");
                        $(".up-img").removeClass("up-opcity");
                    }, 450);

                    numUp = imgContainer.find(".up-section").length;

                    if(numUp >= 8){
                        $('.z_file').hide();
                        //$(this).parent().hide();
                    }

                    //input内容清空
                    $(this).val("");

                    //初始化样式
                    $scope.initCss();

                };

            }

        });

        $(".z_photo").delegate(".close-upimg","click",function(){
            $(".works-mask").show();
            delParent = $(this).parent();
        });

        $(".wsdel-ok").click(function(){
            $(".works-mask").hide();
            var numUp = delParent.siblings().length;

            if(numUp < 9){
                delParent.parent().find(".z_file").show();
            }

            var date = delParent.attr('data-date');

            delParent.remove();

            //将已上传回来的图片缓存集中对应的结果删除
            for(var k=0;k<($scope.upImgContainer).length;k++){
                var arr = ($scope.upImgContainer)[k];
                var arrDate = arr.date;
                if(date == arrDate){
                    ($scope.upImgContainer).splice(k, 1);
                }
            }

            console.log(($scope.upImgContainer));

            //同时将缓存中的图片删除
            for(var i=0;i<($scope.upImgArr).length;i++){
                if($scope.upImgArr[i].date == date){
                    $scope.upImgArr.splice(i, 1);
                }
            }

            $scope.initCss();

        });

        $(".wsdel-no").click(function(){
            $(".works-mask").hide();
        });

        function validateUp(files){
            //替换的文件数组
            var arrFiles = [];

            //不能上传文件名重复的文件
            for(var i = 0, file; file = files[i]; i++){

                //获取文件上传的后缀名
                var newStr = file.name.split("").reverse().join("");

                if(newStr.split(".")[0] != null){

                    var type = newStr.split(".")[0].split("").reverse().join("");

                    if(jQuery.inArray(type, defaults.fileType) > -1){
                        // 类型符合，可以上传
                        if (file.size >= defaults.fileSize) {
                            //mui.toast(file.name +'"文件过大');
                            mui.toast('文件过大');
                        } else {
                            // 在这里需要判断当前所有文件中
                            arrFiles.push(file);
                        }
                    }else{
                        mui.toast('上传类型不符合');
                    }
                }else{
                    mui.toast('没有类型, 无法识别');
                }
            }

            return arrFiles;

        }

    };

    //base64转blob
    $scope.toBlob = function (urlData) {
        var bytes = window.atob(urlData.split(',')[1]);
        // 去掉url的头，并转换为byte
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var  ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab],{type : 'image/jpeg'});
    };

    //开始语音识别
    $scope.vStart = function () {
        var InterValObj; //timer变量，控制时间
        var count = 10; //间隔函数，1秒执行
        var curCount;//当前剩余秒
        curCount = count;

        $scope.curCount = curCount;

        $scope.InterValObj = window.setInterval(function () {

            if (curCount === 1) {
                window.clearInterval($scope.InterValObj);//停止计时器
                $scope.vSubmit();

            } else {
                curCount--;
                $scope.curCount = curCount;
                $scope.$applyAsync();
            }

        }, 1000);

        $scope.voiceState = true;

        wx.ready(function () {

            wx.startRecord({
                success: function(res){
                    console.log(res);
                },
                cancel: function () {
                    //alert('用户拒绝授权录音');
                    mui.toast('你拒绝了授权');
                    $scope.vCancel();
                }
            });

            wx.onVoiceRecordEnd({
                complete: function (res) {
                    $scope.voice.localId = res.localId;
                    mui.toast('录音时间已超过一分钟');
                    $scope.vSubmit();
                }
            });

        });

    };

    $scope.vCancel = function () {
        $scope.curCount = 10;
        window.clearInterval($scope.InterValObj);
        $scope.voiceState = false;

        wx.ready(function () {

            wx.stopRecord({
                success: function (res) {
                    //$scope.voice.localId = res.localId;
                },
                fail: function (res) {
                    //alert(JSON.stringify(res));
                }
            });

        });
    };

    $scope.vSubmit = function () {
        $scope.curCount = 10;
        window.clearInterval($scope.InterValObj);
        $scope.voiceState = false;

        wx.ready(function () {

            wx.stopRecord({
                success: function (res) {
                    $scope.voice.localId = res.localId;

                    if ($scope.voice.localId === '') {
                        //alert('请先使用 startRecord 接口录制一段声音');
                        mui.toast('接口异常，请重新操作');
                        $scope.vCancel();
                        return false;
                    }

                    wx.translateVoice({
                        localId: $scope.voice.localId,
                        complete: function (res) {
                            if (res.hasOwnProperty('translateResult')) {
                                //alert('识别结果：' + res.translateResult);
                                var content = $('#textarea').val();
                                $scope.content = content + res.translateResult;
                                $scope.getNum();
                                $scope.$applyAsync();

                            } else {
                                //alert('无法识别');
                                mui.toast('无法识别');
                                $scope.$applyAsync();
                                $scope.vCancel();
                            }
                        }
                    });

                },
                fail: function (res) {
                    console.log(JSON.stringify(res));
                    mui.toast('语音接口异常');
                    $scope.vCancel();
                }
            });

        });

    };

    //初始化图片插件
    $scope.initImg = function () {
        //data-preview-src="" data-preview-group="1"
        mui.previewImage();
    };

    /*******************************************************方法-end****************************************************/

    /*******************************************************逻辑-start**************************************************/
    //初始化数据
    $scope.INIT();

    //初始化样式
    $scope.initCss();

    //初始化输入框
    $scope.textarea();

    //初始化微信SDK
    $scope.initSDK();

    //初始化是否已读提示框
    $scope.initTips();

    //初始化草稿提示框
    $scope.initDraft();

    //初始化确认咨询提示框
    $scope.initFiremOrder();

    //初始化追问
    $scope.questioning();

    //初始化图片插件
    $scope.initImg();

    //初始化上传
    $scope.imgUp();

    /*******************************************************逻辑-end****************************************************/

});