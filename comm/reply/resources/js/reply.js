commApp.controller('replyController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');
    var vConsole = new VConsole();
    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {

        //data-ripple="ripple"
        new Ripple({
            opacity : 0.6,  //水波纹透明度
            speed : 1,      //水波纹扩散速度
            bgColor : "#fff", //水波纹颜色
            cursor : true  //是否显示手型指针
        });

        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');

        $scope.orderId = common.getUrlParam('orderId');
        $scope.type = common.getUrlParam('type');
        $scope.orderId = parseInt($scope.orderId);
        $scope.type = parseInt($scope.type);

        //图片容器
        $scope.upImgContainerFirst = [];
        $scope.upImgContainerFirstReply = [];
        $scope.upImgContainerMore = [];
        $scope.upImgContainerMoreReply = [];

        //音频容器
        $scope.upVoiceContainerFirstReply = [];
        $scope.upVoiceContainerMoreReply = [];

        //大容器
        $scope.ONE = true;
        $scope.TWO = false;
        $scope.THREE = false;
        $scope.FOUR = false;

        //追问按钮状态
        $scope.questionButton = false;

        //评价插件
        $scope.evaluateState = true;

        //评价结果
        $scope.evaluateResState = false;

        //评价结果值
        $scope.evaluateRes = 0;

        //评价星星值
        $scope.evaluateResult = 0;

        //Two：第二次追问；One：第一次提问
        $scope.downTwo = true;
        $scope.downOne = true;
        $scope.upTwo = false;
        $scope.upOne = false;

        $scope.askContentTwo = '第二次追问';
        $scope.askContentOne = '第一次提问';
        $scope.replyContentTwo = '第二次追问回复';
        $scope.replyContentOne = '第一次提问回复';

        /**************************************************这些是假数据-start**************************************************/
        $scope.dataImgTwo = [
            'http://images.xiaowiba.com/18-12-3/92732603.jpg',
            'http://images.xiaowiba.com/18-12-3/41625047.jpg',
            'http://images.xiaowiba.com/18-12-3/52619075.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg'
        ];
        $scope.dataImgOne = [
            'http://images.xiaowiba.com/18-12-3/92732603.jpg',
            'http://images.xiaowiba.com/18-12-3/41625047.jpg',
            'http://images.xiaowiba.com/18-12-3/52619075.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg'
        ];
        $scope.dataImgReplyTwo = [
            'http://images.xiaowiba.com/18-12-3/92732603.jpg',
            'http://images.xiaowiba.com/18-12-3/41625047.jpg',
            'http://images.xiaowiba.com/18-12-3/52619075.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg'
        ];
        $scope.dataImgReplyOne = [
            'http://images.xiaowiba.com/18-12-3/92732603.jpg',
            'http://images.xiaowiba.com/18-12-3/41625047.jpg',
            'http://images.xiaowiba.com/18-12-3/52619075.jpg',
            'http://images.xiaowiba.com/18-12-3/11782850.jpg'
        ];
        $scope.dataSoundTwo = [
            1,2,3
        ];
        $scope.dataSoundOne = [
            4,5,6
        ];
        $scope.sound = 'http://pan.xiaowiba.com/vfm-admin/vfm-downloader.php?q=dXBsb2Fkcy90ZXN0LyVFNSVCMCU4RiVFNiU5OSVCQS0tLSVFNSVCMCU5MSVFOSVCRSU5OSVFNyU5QSU4NCVFNSU5QiU5RSVFNSVCRiU4Ni5tcDM=&h=52f34011449c98ee7b08b7b3079a8f16&sh=b4c045d9afb4261ff57ac53383c3c5fe';
        /**************************************************这些是假数据-end**************************************************/

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
            url:'../reply/resources/json/consultOrder-done.json',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                orderId:$scope.orderId,
                type:$scope.type
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
                    $scope.contentFirst = data.contentFirst;            //第一次问
                    if($scope.contentFirst === null){
                        $scope.contentFirst = [];
                    }
                    $scope.contentFirstReply = data.contentFirstReply;  //第一次问的回复
                    if($scope.contentFirstReply === null){
                        $scope.contentFirstReply = [];
                    }
                    $scope.contentMore = data.contentMore;              //第二次追问
                    if($scope.contentMore === null){
                        $scope.contentMore = [];
                    }
                    $scope.contentMoreReply = data.contentMoreReply;    //第二次追问回复
                    if($scope.contentMoreReply === null){
                        $scope.contentMoreReply = [];
                    }
                    $scope.remainTime = data.remainTime;                //预计回复时间
                    $scope.remainTime = ($scope.remainTime).substring(0, 13);
                    $scope.outTradeNo = data.outTradeNo;                //商户订单号
                    $scope.totalFee = data.totalFee;                    //金额
                    $scope.addTime = data.addTime;                      //创建时间
                    $scope.state = data.state;                          //订单状态
                    $scope.payTime = data.payTime;                      //支付时间
                    $scope.scheduleTime1 = data.scheduleTime1;          //问诊进度时间1
                    $scope.scheduleTime2 = data.scheduleTime2;          //问诊进度时间2
                    $scope.scheduleTime3 = data.scheduleTime3;          //问诊进度时间3
                    $scope.type = data.type;                            //订单类型0全部1待付款2待回复3已完成4已关闭5待查看6退款中
                    $scope.contentType = data.contentType;              //回复状态1正常无回复2正常有回复3追问无回复4追问有回复5正常待查看6追问待查看7超时关闭8退款关闭9退款中
                    $scope.closeReson = data.closeReson;                //关闭原因
                    //$scope.upImgContainerFirst = [];                  //第一次问的图片容器在最外面已经声明了
                    $scope.more = data.more;                            //是否可追问1是0否
                    $scope.more = parseInt($scope.more);
                    $scope.score = data.score;                          //分数
                    $scope.score = parseInt(data.score);
                    $scope.firstTime = data.firstTime;                  //首次问诊时间
                    $scope.replyTime = data.replyTime;                  //首次回复时间
                    $scope.moreTime = data.moreTime;                    //追问时间
                    $scope.replyMoreTime = data.replyMoreTime;          //回复追问时间
                    $scope.getScore = data.getScore;                    //是否已打分1是0否
                    $scope.getScore = parseInt(data.getScore);

                    //对第一次的提问
                    for(var i=0;i<$scope.contentFirst.length;i++){
                        var arr = $scope.contentFirst[i];
                        var contTypeFirst = arr.contType;//类型(1文字2图片3语音4视频)
                        var contFirst = arr.cont;

                        switch (contTypeFirst) {
                            //文字
                            case 1:
                                $scope.contentFirstArr = contFirst;
                                $scope.contentFirstArrSimple = common.opStr(contFirst, 40);
                                $scope.askContentOne = $scope.contentFirstArrSimple;
                                break;
                            //图片
                            case 2:
                                ($scope.upImgContainerFirst).push({
                                    date:i,
                                    src:contFirst
                                });
                                break;
                            //语音
                            case 3:
                                break;
                            case 4:
                                break;
                        }
                    }

                    //对第一次的提问的回复
                    for(var j=0;j<$scope.contentFirstReply.length;j++){
                        var brr = $scope.contentFirstReply[j];
                        var contTypeFirstReply = brr.contType;//类型(1文字2图片3语音4视频)
                        var contFirstReply = brr.cont;
                        var lengthFirstReply = brr.length;

                        switch (contTypeFirstReply) {
                            //文字
                            case 1:
                                $scope.contentFirstReplyArr = contFirstReply;
                                $scope.replyContentOne = $scope.contentFirstArr;
                                break;
                            //图片
                            case 2:
                                ($scope.upImgContainerFirstReply).push({
                                    date:i,
                                    src:contFirstReply
                                });
                                break;
                            //语音
                            case 3:
                                ($scope.upVoiceContainerFirstReply).push({
                                    date:i,
                                    src:contFirstReply,
                                    length:lengthFirstReply
                                });
                                break;
                            case 4:
                                break;
                        }
                    }

                    //对第二次的追问
                    for(var k=0;k<$scope.contentMore.length;k++){
                        var crr = $scope.contentMore[k];
                        var contTypeMore = crr.contType;//类型(1文字2图片3语音4视频)
                        var contMore = crr.cont;

                        switch (contTypeMore) {
                            //文字
                            case 1:
                                $scope.contentMoreArr = contMore;
                                $scope.contentMoreArrSimple = common.opStr(contMore, 40);
                                $scope.askContentTwo = $scope.contentMoreArrSimple;
                                break;
                            //图片
                            case 2:
                                ($scope.upImgContainerMore).push({
                                    date:i,
                                    src:contMore
                                });
                                break;
                            //语音
                            case 3:
                                break;
                            case 4:
                                break;
                        }
                    }

                    //对第二次的追问的回复
                    for(var p=0;p<$scope.contentMoreReply.length;p++){
                        var drr = $scope.contentMoreReply[p];
                        var contTypeMoreReply = drr.contType;//类型(1文字2图片3语音4视频)
                        var contMoreReply = drr.cont;
                        var lengthReply = drr.length;

                        switch (contTypeMoreReply) {
                            //文字
                            case 1:
                                $scope.contentMoreReplyArr = contMoreReply;
                                $scope.replyContentTwo = $scope.contentMoreReplyArr;
                                break;
                            //图片
                            case 2:
                                ($scope.upImgContainerMoreReply).push({
                                    date:i,
                                    src:contMoreReply,
                                    length:lengthReply
                                });
                                break;
                            //语音
                            case 3:
                                ($scope.upVoiceContainerMoreReply).push({
                                    date:i,
                                    src:contMoreReply,
                                    length:lengthReply
                                });
                                break;
                            case 4:
                                break;
                        }
                    }

                    //对是否已打分的判断 1是0否
                    if($scope.getScore === 1){
                        //评价插件
                        $scope.evaluateState = false;

                        //评价结果
                        $scope.evaluateResState = true;

                        //评价结果显示值
                        $scope.evaluateRes = $scope.score;

                        //评价星星值
                        $scope.evaluateResult = $scope.score/2;
                    }else{
                        //评价插件
                        $scope.evaluateState = true;

                        //评价结果
                        $scope.evaluateResState = false;
                    }

                    //对各种状态的判断回复状态:
                    //1正常无回复2正常有回复3追问无回复4追问有回复5正常待查看6追问待查看7超时关闭8退款关闭9退款中
                    switch ($scope.contentType) {
                        //正常无回复
                        case 1:
                            $scope.ONE = true;
                            $scope.TWO = false;
                            $scope.THREE = false;
                            $scope.FOUR = false;

                            //评价插件
                            $scope.evaluateState = false;

                            //评价结果
                            $scope.evaluateResState = false;
                            break;
                        //正常有回复
                        case 2:
                            $scope.ONE = true;
                            $scope.TWO = true;
                            $scope.THREE = false;
                            $scope.FOUR = false;
                            $('.reply-ask-one').css('margin-top', '-45px');
                            break;
                        //追问无回复
                        case 3:
                            $scope.ONE = true;
                            $scope.TWO = true;
                            $scope.THREE = true;
                            $scope.FOUR = false;
                            break;
                        //追问有回复
                        case 4:
                            $scope.ONE = true;
                            $scope.TWO = true;
                            $scope.THREE = true;
                            $scope.FOUR = true;
                            break;
                        //正常待查看
                        case 5:
                            $scope.ONE = true;
                            $scope.TWO = false;
                            $scope.THREE = false;
                            $scope.FOUR = false;
                            $('.reply-ask-one').css('margin-top', '-45px');

                            //评价插件
                            $scope.evaluateState = false;

                            //评价结果
                            $scope.evaluateResState = false;
                            break;
                        //追问待查看
                        case 6:
                            $scope.ONE = true;
                            $scope.TWO = true;
                            $scope.THREE = true;
                            $scope.FOUR = true;
                            break;
                        //超时关闭
                        case 7:
                            $scope.ONE = true;
                            $scope.TWO = false;
                            $scope.THREE = false;
                            $scope.FOUR = false;

                            //评价插件
                            $scope.evaluateState = false;

                            //评价结果
                            $scope.evaluateResState = false;
                            break;
                        //退款关闭
                        case 8:
                            $scope.ONE = true;
                            $scope.TWO = false;
                            $scope.THREE = false;
                            $scope.FOUR = false;

                            //评价插件
                            $scope.evaluateState = false;

                            //评价结果
                            $scope.evaluateResState = false;
                            break;
                    }

                    //对追问按钮的判断
                    if($scope.more === 1){
                        $scope.questionButton = true;
                    }else{
                        $scope.questionButton = false;
                    }

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

    $scope.toggleTwo = function () {

        //当为关闭状态时
        if($scope.downTwo === true){
            $scope.askContentTwo = $scope.contentMoreArr;
                // '想再问一下我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '想再问一下我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '想再问一下我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '去医院检查，医生说是换上了淋巴水肿，经过一段时间的治疗，病情有好转，换上淋巴水肿在饮食上在吃什么好？';
            $scope.downTwo = false;
            $scope.upTwo = true;
        }else{
            $scope.askContentTwo = $scope.contentMoreArrSimple;
                // '想再问一下我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '去医院检查，医生说是换上了淋巴水肿，经过一段时间的治疗，病情有好转，换上淋巴水肿在饮食上在吃什么好？';
            $scope.downTwo = true;
            $scope.upTwo = false;
        }
    };

    $scope.toggleOne = function () {

        //当为关闭状态时
        if($scope.downOne === true){
            $scope.askContentOne = $scope.contentFirstArr;
                // '我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '去医院检查，医生说是换上了淋巴水肿，经过一段时间的治疗，病情有好转，换上淋巴水肿在饮食上在吃什么好？';
            $scope.downOne = false;
            $scope.upOne = true;
        }else{
            $scope.askContentOne = $scope.contentFirstArrSimple;
                // '我以前身体特别健康，去年感觉皮肤皱纹加深，皮肤增厚变得粗糙，看上去像大象的皮肤。' +
                // '去医院检查，医生说是换上了淋巴水肿，经过一段时间的治疗，病情有好转，换上淋巴水肿在饮食上在吃什么好？';
            $scope.downOne = true;
            $scope.upOne = false;
        }
    };

    //初始化图片插件
    $scope.initImg = function () {
        mui.previewImage();
    };

    //初始化音频
    //不用了
    $scope.initAudio = function () {
        var dshiqi = null;

        //录音播放
        $(".reply-doctor-sound-label").on("click", function () {
            //先暂停其他的
            console.log($(this));
            $(this).siblings().find("audio")[0].pause();
            //$(this).siblings().find("s").removeClass("bofang");
            var audio = $(this).find("audio")[0],
                time = $(this).data("time");
            if (audio.paused) {
                audio.play(); //audio.play();// 这个就是播放
                $(this).find("s").addClass("bofang");
                dshiqi = setTimeout(function () { //dshiqi是外层定义好的一个变量！
                    $(this).find("s").removeClass("bofang"); //播放完毕去除动画
                }, time * 1000)
            } else {
                audio.pause(); // 这个就是暂停
                $(this).find("s").removeClass("bofang");
                clearTimeout(dshiqi);
            }
        });
    };

    //播放录音
    $scope.play = function ($event, sound) {
        $('.reply-doctor-sound-label').removeClass('reply-doctor-sound-label-false');

        var audioArr = $('audio');

        audioArr.each(function () {
            this.pause();
        });

        var that = $event.target;

        that.className = 'reply-doctor-sound-label reply-doctor-sound-label-false bounceIn animated';

        var audio = $event.target.childNodes[1];

        if(audio.paused){
            audio.play();
        }else{
            audio.pause();
        }

        setTimeout(function () {
            that.className = 'reply-doctor-sound-label';
        }, sound*1000);

    };

    //过滤音频地址使其可用
    $scope.voiceUrl = function(url){
        return $sce.trustAsResourceUrl(url);
    };

    //初始化评价插件
    $scope.star = function () {
        $("#star").markingSystem({
            backgroundImageInitial: 'images/star_hollow.png',
            backgroundImageOver: 'images/star_solid.png',
            num: 5,
            havePoint: false,
            haveGrade: true,
            unit: '分',
            grade: 0,
            height: 30,
            width: 30
        });
    };

    //初始化已评价插件
    $scope.hasStar = function () {
        if($scope.evaluateState === false){
            $("#starRes").markingSystem({
                backgroundImageInitial: 'images/star_hollow.png',
                backgroundImageOver: 'images/star_solid.png',
                num: 5,
                havePoint: false,
                haveGrade: false,
                unit: '分',
                grade: $scope.evaluateResult,
                height: 30,
                width: 30
            });

        }

    };

    //追问
    $scope.goConsult = function () {
        window.location.href = '../consult/consult.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&orderId=' + $scope.orderId +
            '&moreQu=1';
    };

    //提交评价
    $scope.evaluateSubmit = function () {
        mui.showLoading('正在加载..', 'div');

        setTimeout(function () {
            $scope.$apply(function(){
                mui.hideLoading();

                //数据的保存操作已经在插件中实现
                var evaluateResult = +($('#evaluateResult').val());
                $scope.evaluateState = false;
                $scope.evaluateResState = true;
                $scope.evaluateRes = evaluateResult;

                $("#starRes").markingSystem({
                    backgroundImageInitial: 'images/star_hollow.png',
                    backgroundImageOver: 'images/star_solid.png',
                    num: 5,
                    havePoint: false,
                    haveGrade: false,
                    unit: '分',
                    grade: evaluateResult/2,
                    height: 30,
                    width: 30
                });

                //将页面滑动到最底部
                var height = +($(document).height()) + 500;

                $('html, body, .reply-evaluate-result').animate({
                    scrollTop: height
                }, 1500);

            });

        }, 500);
        
        return false;

        //数据的保存操作已经在插件中实现
        var evaluateResult = +($('#evaluateResult').val());
        $scope.evaluateState = false;
        $scope.evaluateResState = true;
        $scope.evaluateRes = evaluateResult;

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/score',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                doctorId:$scope.doctorId,
                doctorPlatformKey:$scope.doctorPlatformKey,
                orderId:$scope.orderId,
                score:$scope.evaluateRes
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('评价异常');
                    mui.hideLoading();
                    return false;
                }

                var result = Data.result;

                if(result === 200){

                    $scope.$apply(function(){

                        $("#starRes").markingSystem({
                            backgroundImageInitial: 'images/star_hollow.png',
                            backgroundImageOver: 'images/star_solid.png',
                            num: 5,
                            havePoint: false,
                            haveGrade: false,
                            unit: '分',
                            grade: evaluateResult/2,
                            height: 30,
                            width: 30
                        });

                        //将页面滑动到最底部
                        var height = +($(document).height()) + 500;

                        $('html, body, .reply-evaluate-result').animate({
                            scrollTop: height
                        }, 1500);

                    });

                }else{
                    mui.toast('评价异常');
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('评价异常');
                mui.hideLoading();
            }
        });
    };

    $scope.back = function () {
        //window.location.href = document.referrer;

        window.location.href = '../order/orderList.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取订单详情
    $scope.getOrder();

    //初始化图片插件
    $scope.initImg();

    //初始化音频
    //$scope.initAudio();

    //初始化评价插件
    $scope.star();

    //初始化已评价插件
    $scope.hasStar();

    /*******************************************************逻辑-end***********************************************************/

});