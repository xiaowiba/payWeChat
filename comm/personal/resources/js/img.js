commApp.controller('imgController', function ($scope, $state, $http, $filter, $timeout, $sce) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    /**
     * 保存头像接口
     * https://apidevelop.mdruby.cn/swagger/ui/index#!/Consult/Consult_UploadHeadImgByWechat
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
                mui.toast('接口异常');
                mui.hideLoading();
            }
        });

    };

    //初始化图片插件
    $scope.initImg = function () {
        //data-preview-src="" data-preview-group="1"
        //mui.previewImage();

        var $clip = $("#clip");
        var $file = $("#file");

        $("#toggle-file").click(function() {
            $file.trigger("click");
        });

        $clip.photoClip({
            width: 250,
            height: 250,
            fileMinSize: 20,
            file: $file,
            //defaultImg: '../resources/img/female.png',
            ok: '#clipBtn',
            loadStart: function() {
                console.log("照片读取中");
            },
            loadProgress: function(progress) {
                console.log(progress);
            },
            loadError: function() {
                console.log("图片加载失败");
                mui.toast('图片加载失败');
            },
            loadComplete: function() {
                console.log("照片读取完成");
            },
            imgSizeMin: function(kbs) {
                console.log(kbs, "上传图片过小");
                mui.toast('上传图片过小');
            },
            clipFinish: function(dataURL) {

                if(dataURL){
                    mui.showLoading('正在加载..', 'div');

                    var blobs = $scope.toBlob(dataURL);

                    //创建formData对象
                    var fd = new FormData();

                    fd.append('name', blobs, '1.jpg');

                    mui.toast('演示数据,不可操作');
                    mui.hideLoading();
                    return false;

                    $.ajax({
                        async: true,
                        method: 'post',
                        processData : false,
                        contentType: false,
                        url: $scope.addaUrl + '/rest/consult/headImg/wx/' + $scope.patientId + '/' + $scope.patientPlatformKey,
                        data: fd,
                        success:function (Data) {
                            mui.hideLoading();

                            if(Data.result === 200){

                                mui.toast('保存成功');

                                setTimeout(function () {
                                    window.location.href = 'personalEdit.html' +
                                        '?account=' + $scope.account +
                                        '&openId=' + $scope.openId;
                                }, 500);

                            }else{
                                mui.toast('上传异常,请稍后重试');

                            }

                        },
                        error:function (err) {
                            console.log(err);
                            mui.toast('上传异常,请稍后重试');
                            mui.hideLoading();
                        }
                    });
                }

            }
        });

    };

    //base64转blob
    $scope.toBlob = function (urlData) {
        var bytes = window.atob(urlData.split(',')[1]);
        // 去掉url的头，并转换为byte
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab],{type : 'image/jpeg'});
    };

    $scope.go = function () {
        window.location.href = 'personalEdit.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //初始化图片插件
    $scope.initImg();

    /*******************************************************逻辑-end***********************************************************/

});