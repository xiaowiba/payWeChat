commApp.controller('personalController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    /**
     * 个人中心接口文档
     * https://apidevelop.mdruby.cn/swagger/ui/index#!/Consult/Consult_getWXAccountCenterInfo
     * VerificationCode
     * Consult
     * @constructor
     */
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');

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

                //var data = (JSON.parse(Data)).data;
                var data = Data.data;

                //微信openID
                $scope.openId = data.openId;

                //病人id
                $scope.patientId = data.patientId;

                //接口平台url
                $scope.addaUrl = data.addaUrl;

                //key
                $scope.patientPlatformKey = data.accessKey;

                //获取数量信息
                $scope.initNum();

                //mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取患者异常');
                mui.hideLoading();
            }
        });

    };

    //获取数量信息
    $scope.initNum = function () {
        $.ajax({
            async: true,
            method: 'post',
            url:'../personal/resources/json/infoCount.json',
            data:{
                patientId:$scope.patientId,
                patientPlatformKey:$scope.patientPlatformKey
            },
            success:function (Data) {

                if(Data === null || Data === '' || Data === undefined){
                    mui.toast('获取数量异常');
                    mui.hideLoading();
                    return false;
                }

                var data = Data.data;
                $scope.draftCount = data.draftCount;        //草稿数量
                $scope.questionCount = data.questionCount;  //咨询数量
                $scope.doctorCount = data.doctorCount;      //关注的医生数量

                //获取个人信息
                $scope.getInfo();

                //mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取数量异常');
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
            url: '../personal/resources/json/info.json',
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
                    $scope.phone = data.phone;
                    $scope.birthday = data.birthday;

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

                $('#pIMG').attr('src', Data.message);

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取微信头像异常');
                mui.hideLoading();
            }
        });
    };

    $scope.go = function (val, type) {
        if(type === 1){
            window.location.href = val + '.html?account=' + $scope.account + '&openId=' + $scope.openId + '&attn=1';
        }else{
            window.location.href = val + '.html?account=' + $scope.account + '&openId=' + $scope.openId;
        }

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //获取数量信息
    //$scope.initNum();

    //获取个人信息
    //$scope.getInfo();

    //获取微信自带的头像信息
    //$scope.getWXImg();

    /*******************************************************逻辑-end***********************************************************/

});
