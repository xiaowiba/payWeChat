commApp.controller('doctorDetailController', function ($scope, $state, $http, $filter, $timeout, $sce) {
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
        $scope.doctorId = common.getUrlParam('doctorId');       //医生id
        $scope.platformKey = common.getUrlParam('platformKey'); //医生平台key

        $scope.down = true;
        $scope.up = false;

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

    //获取医生详情
    $scope.initDoctor = function () {
        $.ajax({
            async: false,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/doctor',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                doctorId:$scope.doctorId,
                doctorPlatformKey:$scope.platformKey
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取详情异常');
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;

                $scope.attn = data.attn ? data.attn : 0;                                                //是否已关注0未1已关注
                $scope.headImg = data.headImg ? data.headImg : '../resources/img/male.png';             //头像
                $scope.doctorName = data.doctorName ? data.doctorName : '';                             //医生姓名
                $scope.profLevelName = data.profLevelName ? data.profLevelName : '';                    //医生职称
                $scope.deptName = data.deptName ? data.deptName : '';                                   //医生部门
                $scope.hospName = data.hospName ? data.hospName : '';                                   //医生医院
                $scope.doctorFieldList = data.doctorFieldList ? data.doctorFieldList : '';              //医生擅长领域
                $scope.doctorFieldListArr = '';                                                         //领域容器
                $scope.roomStatus = data.roomStatus ? data.roomStatus : 0;                              //诊室状态0关1开
                $scope.roomState = false;
                $scope.price = data.price;                                                              //价格
                $scope.workStart = data.workStart;                                                      //工作始于
                $scope.resume = data.resume ? data.resume : '';                                         //简介
                $scope.lessResume = common.opStr($scope.resume, 40) ? common.opStr($scope.resume, 40) : '';//减缩版简介
                $scope.consultOnlineList = data.consultOnlineList ? data.consultOnlineList : '';        //接诊时间

                $('.doctorDetail-img').css('background', 'url(' + data.headImg + ')')
                    .css('background-size', '70% 70%')
                    .css('background-repeat', 'no-repeat')
                    .css('background-position', 'center center');

                //对关注的判断
                if($scope.attn === 1){
                    $scope.followFont = '已关注';
                    $scope.followStyle = 'doctorDetail-follow-true';
                }else{
                    $scope.followFont = '关注';
                    $scope.followStyle = 'doctorDetail-follow-false';
                }

                //对简介的判断
                $scope.summary = $scope.lessResume;

                //对擅长领域的判断
                for(var i=0;i<(data.doctorFieldList).length;i++){
                    var arr = (data.doctorFieldList)[i];
                    if(!arr){
                        continue;
                    }

                    $scope.doctorFieldListArr += '<span>' + arr + '</span>';
                }

                //对接诊时间的判断
                for(var j=0;j<(data.consultOnlineList).length;j++){
                    var brr = (data.consultOnlineList)[j];

                    $('#' + brr).html('接诊').addClass('receive');
                }

                //对诊室状态的判断
                if($scope.roomStatus === 0){
                    $scope.roomState = false;
                }else{
                    $scope.roomState = true;
                }

                //对从业时间的判断
                $scope.workTime = $scope.getTime($scope.workStart);

                mui.hideLoading();
            },
            error:function (err) {
                console.log(err);
                mui.toast('获取详情异常');
                mui.hideLoading();
            }
        });
    };

    //计算时间间隔
    $scope.getTime = function (val) {
        val = '2018-02';
        var startTime = new Date(val);                      //开始时间
        var endTime = new Date();                           //结束时间
        var time = endTime - startTime;                     //毫秒数
        var day = Math.floor((time) / 1000 / 60 / 60 / 24); //天数
        var month = Math.ceil(day/30);
        var year = 0;
        var result = '';

        if(month > 11){
            year = Math.floor(month/12);
            month = month - 12;
        }

        if(year === 0){
            result = month + '个月';
        }else{
            if(month === 0){
                result = year + '年';
            }else{
                result = year + '年' + month + '个月';
            }

        }

        return result;
    };

    //关注操作
    $scope.follow = function () {

        mui.showLoading('正在加载..', 'div');

        var attn = 2;

        if($scope.attn === 1){
            //已关注给予取消关注
            attn = 2;
        }else{
            //未关注的给予关注
            attn = 1;
        }

        $.ajax({
            async: true,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/consultAttn',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey,
                doctorId:$scope.doctorId,
                doctorPlatformKey:$scope.platformKey,
                attn:attn
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('关注异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){

                    //mui.toast(Data.message);

                    if(attn === 1){
                        $scope.followFont = '已关注';
                        $scope.followStyle = 'doctorDetail-follow-true';
                        $scope.attn = 1;
                    }else{
                        $scope.followFont = '关注';
                        $scope.followStyle = 'doctorDetail-follow-false';
                        $scope.attn = 0;
                    }

                    $scope.$applyAsync();

                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('关注异常');
                mui.hideLoading();
            }
        });

    };

    $scope.toggle = function () {

        //当为关闭状态时
        if($scope.down === true){
            $scope.summary = $scope.resume;
            $scope.down = false;
            $scope.up = true;
        }else{
            $scope.summary = $scope.lessResume;
            $scope.down = true;
            $scope.up = false;
        }

    };

    $scope.goConsult = function () {
        window.location.href = '../consult/consult.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&doctorId=' + $scope.doctorId +
            '&doctorName=' + $scope.doctorName +
            '&doctorPlatformKey=' + $scope.platformKey +
            '&price=' + $scope.price +
            '&moreQu=0';//是否追问0：正常问；1：追问

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取医生详情
    $scope.initDoctor();

    /*******************************************************逻辑-end***********************************************************/

});