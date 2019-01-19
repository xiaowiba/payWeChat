commApp.controller('personalEditController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');

        //性别对照
        $scope.SEX = {
            '10000855':'男',
            '10000856':'女',
            '10000857':'不明'
        };

        //整体
        $scope.personal = true;

        //电话
        $scope.pPhone = false;

        $scope.newPhone = '';
        $scope.newCode = '';

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

                //获取个人信息
                $scope.getInfo();

            },
            error:function (err) {
                console.log(err);
                mui.toast('接口异常');
                mui.hideLoading();
            }
        });

    };

    //获取个人信息
    $scope.getInfo = function () {
        $.ajax({
            async: true,
            method: 'post',
            type: 'json',
            url: $scope.addaUrl + '/rest/consult/patient/center/' + $scope.patientPlatformKey + '/'+$scope.patientId + '/info',
            data:{
                userAccountId:$scope.patientId,
                platfromKey:$scope.patientPlatformKey
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取个人信息异常');
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;

                if(Data.result === 200){
                    $scope.hasHeadImg = data.hasHeadImg;
                    $scope.headImgUrl = data.headImgUrl;
                    $scope.name = data.name;
                    $scope.gender = data.gender;
                    $scope.sex = $scope.SEX[$scope.gender];
                    $scope.phone = data.phone;
                    $scope.birthday = data.birthday;
                    $scope.birthday = $scope.birthday.substring(0, 10);

                    if($scope.hasHeadImg === false){
                        //获取微信自带的头像信息
                        $scope.getWXImg();
                    }else{
                        $('#pIMG').attr('src', $scope.headImgUrl);
                    }

                }else{
                    mui.toast('获取个人信息异常');
                    mui.hideLoading();
                    return false;
                }

                $scope.$applyAsync();

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取个人信息异常');
                mui.hideLoading();
            }
        });
    };

    //获取微信自带的头像信息
    $scope.getWXImg = function () {
        $.ajax({
            async: false,
            method: 'post',
            url: '/userH5Api/getHeadImg',
            data:{
                openId:$scope.openId
            },
            success:function (data) {

                var Data = (JSON.parse(data));

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取微信头像异常');
                    mui.hideLoading();
                    return false;
                }

                $scope.headImgUrl = Data.message;

                $('#pIMG').attr('src', Data.message);

                $scope.$applyAsync();

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取微信头像异常');
                mui.hideLoading();
            }
        });
    };

    //姓名修改
    $scope.initName = function () {
        $('#name').on('tap', function(e) {
            //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
            e.detail.gesture.preventDefault();

            var btnArray = ['取消', '确定'];

            mui.prompt('', '', '修改姓名', btnArray, function(e) {
                var value = e.value;
                var index = e.index;

                if(value === ''){
                    value = $scope.name;
                }

                if (index === 1) {
                    var judge = $scope.judge(value);
                    if(judge === 1){
                        $scope.name = value;
                        $scope.$applyAsync();
                    }else if(judge === -1){
                        mui.toast('请输入汉字');
                        return false;
                    }else if(judge === -2){
                        mui.toast('长度不超过10位');
                        return false;
                    }

                    $scope.update();

                } else {
                    //取消操作
                }

            })
        });

    };

    //判断名字
    $scope.judge = function (val) {
        var isZH_CN = /^[\u4e00-\u9fa5]{0,}$/;
        console.log(val.length);

        if (isZH_CN.test(val)) {
            if(val.length < 11){
                return 1
            }else{
                return -2;
            }
        }else{
            return -1;
        }

    };

    //性别
    $scope.initSex = function () {
        var hospitalPicker = new mui.PopPicker({
            layer: 1
        });

        var arr = [
            {text:'男', value:'10000855'},
            {text:'女', value:'10000856'}
            ];

        hospitalPicker.setData(arr);

        $('#sex').on('tap', function(){
            hospitalPicker.show(function(items){

                var text = items[0].text;
                var val = items[0].value;

                $scope.sex = text;
                $scope.gender = val;

                $scope.$applyAsync();

                $scope.update();

                //MUI大坑！去掉多余的
                var crr = $('.mui-poppicker');
                for(var j=0;j<crr.length;j++){
                    var drr = crr[j];
                    if(j !== 0){
                        drr.remove();
                    }
                }

            });
        });
    };

    //生日
    $scope.initBirthday = function () {
        var date = new Date();
        var nowY = date.getFullYear();
        var nowM = date.getMonth()+1;
        var nowD = date.getDate();

        var dtpicker = new mui.DtPicker(
            {
                type:'date',
                beginDate: new Date(1800, 0, 1),
                endDate: new Date(nowY, nowM-1, nowD),
                labels: ['年', '月', '日']
            }
        );

        $('#birthday').on('tap', function() {
            dtpicker.show(function(e) {
                var y = e.y.value;
                var m = common.removeTens(e.m.value);
                var d = common.removeTens(e.d.value);

                $scope.birthday = y + '-' + m + '-' + d;

                $scope.$applyAsync();

                $scope.update();

            });

        });
    };

    //修改电话
    $scope.editPhone = function () {
        $scope.personal = false;
        $scope.pPhone = true;
        $('#title').html('更换绑定手机号');
        $scope.$applyAsync();
    };

    $scope.cancelPhone = function () {
        $scope.personal = true;
        $scope.pPhone = false;
        $scope.newPhone = '';
        $scope.newCode = '';
        $('#title').html('个人信息');
    };

    $scope.submitPhone = function () {
        if($scope.newPhone === '' || $scope.newCode === ''){
            mui.toast('请输入手机号码及验证码');
            return false;
        }

        if(!(common.isPhoneNo($scope.newPhone))){
            mui.toast('手机号码格式错误');
            return false;
        }

        mui.showLoading('正在加载..', 'div');

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/verificationcode/patient/' + $scope.patientPlatformKey + '/' + $scope.patientId + '/' + $scope.newPhone + '/' + $scope.newCode + '/verify',
            data:{
                platfromKey:$scope.patientPlatformKey,
                userAccountId:$scope.patientId,
                phone:$scope.newPhone,
                code:$scope.newCode
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('保存异常,请稍后重试');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){
                    mui.toast('保存成功');

                    setTimeout(function () {
                        window.location.href = 'personalEdit.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId;
                    }, 1000);

                    // $scope.personal = true;
                    // $scope.pPhone = false;
                    // $('#title').html('个人信息');
                    //
                    // $scope.$applyAsync();

                }else{
                    mui.toast('验证码有误');
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('保存异常,请稍后重试');
                mui.hideLoading();
            }
        });

    };

    $scope.getVerify = function () {

        if($scope.newPhone === ''){
            mui.toast('请输入手机号码');
            return false;
        }

        if(!(common.isPhoneNo($scope.newPhone))){
            mui.toast('手机号码格式错误');
            return false;
        }

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/verificationcode/patient/' + $scope.patientPlatformKey + '/' + $scope.patientId + '/' + $scope.newPhone + '/apply',
            data:{
                platfromKey:$scope.patientPlatformKey,
                userAccountId:$scope.patientId,
                phone:$scope.newPhone
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取验证码异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){
                    var getCode = $('#getCode');
                    var InterValObj;    //timer变量，控制时间
                    var count = 60;     //间隔函数，1秒执行
                    var curCount;       //当前剩余秒数

                    curCount = count;

                    //设置button效果，开始计时
                    getCode.attr("disabled", "true");

                    getCode.html(curCount + "秒后获取");
                    InterValObj = window.setInterval(function () {
                        if (curCount === 1) {
                            window.clearInterval(InterValObj);//停止计时器
                            getCode.removeAttr("disabled");//启用按钮
                            getCode.html("获取验证码");
                        } else {
                            curCount--;
                            getCode.html(curCount + "秒后获取");
                        }
                    }, 1000);

                }else{
                    mui.toast(Data.message);
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取验证码异常');
                mui.hideLoading();
            }
        });

    };

    //修改头像
    $scope.editImg = function () {
        window.location.href = 'img.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId;
    };

    //保存全部信息
    $scope.update = function () {
        mui.showLoading('正在加载..', 'div');

        $.ajax({
            async: true,
            method: 'post',
            url: $scope.addaUrl + '/rest/consult/patient/center/update',
            data:{
                platfromKey:$scope.patientPlatformKey,
                userAccountId:$scope.patientId,
                headImgUrl:$scope.headImgUrl,
                name:$scope.name,
                gender:$scope.gender,
                phone:$scope.phone,
                birthday:$scope.birthday
            },
            success:function (data) {

                var Data = data;

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('保存异常');
                    mui.hideLoading();
                    return false;
                }

                if(Data.result === 200){
                    mui.toast('保存成功');
                    /*setTimeout(function () {
                        window.location.href = 'personal.html' +
                            '?account=' + $scope.account +
                            '&openId=' + $scope.openId;
                    }, 1000);*/
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('保存异常');
                mui.hideLoading();
            }
        });
    };

    $scope.back = function () {
        window.location.href = 'personal.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //姓名修改
    $scope.initName();

    //性别
    $scope.initSex();

    //生日
    $scope.initBirthday();

    /*******************************************************逻辑-end***********************************************************/

});