commApp.controller('doctorMenuController', function ($scope, $state, $http, $filter, $timeout, $sce, $compile) {
    mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.attn = +(common.getUrlParam('attn'));
        $scope.pageIndex = 1;
        $scope.pageSize = 2;

        if($scope.attn === 1){
            //关注列表
            $scope.doctorListState = false;
            $scope.attn = 1;
        }else{
            //全部列表
            $scope.doctorListState = true;
            $scope.attn = 0;
        }

        $.ajax({
            async: false,
            method: 'get',
            url:'/wxPayH5Api/payIndex',
            data:{
                account:$scope.account,
                openId:$scope.openId
            },
            success:function (Data) {
                var data = (JSON.parse(Data)).data;

                //微信openID
                $scope.openId = data.openId;

                //病人id
                $scope.patientId = data.patientId;

                //接口平台url
                $scope.addaUrl = data.addaUrl;

                //key
                $scope.accessKey = data.accessKey;

                mui.hideLoading();
            },
            error:function (err) {
                console.log(err);
                mui.toast('获取患者异常');
                mui.hideLoading();
            }
        });

    };

    //初始化分页
    $scope.initPage = function () {
        $('.khfxWarp').dropload({
            scrollArea: window,
            domDown: {
                domClass: 'dropload-down',
                domRefresh: '<div class="dropload-refresh">上拉加载更多</div>',
                domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData: '<div class="dropload-noData">已无数据</div>'
            },
            loadDownFn: function (me) {
                $.ajax({
                    async: false,
                    method: 'post',
                    url:$scope.addaUrl + '/rest/consult/doctorList',
                    data:{
                        patientId:$scope.patientId,
                        patientPlatformKey:$scope.accessKey,
                        attn:$scope.attn,
                        pageIndex:$scope.pageIndex,
                        pageSize:$scope.pageSize
                    },
                    success:function (Data) {
                        var data = Data.data;
                        var consultDoctorList = data.consultDoctorList;
                        var length = consultDoctorList.length;

                        if(Data.result === 200){

                            if (length === 0) {
                                //me.resetload();
                                me.lock();
                                me.noData();
                                me.resetload();
                                return false;
                            }else{
                                $scope.pageIndex ++;

                                var result = '';
                                for (var index = 0; index < length; index++) {
                                    var arr = consultDoctorList[index];
                                    var doctorId = arr.doctorId;                                            //医生id
                                    var platformKey = arr.platformKey;                                      //医生平台key
                                    var attn = arr.attn;                                                    //是否已关注0未1已关注
                                    var headImg = arr.headImg ? arr.headImg : '../resources/img/male.png';  //头像
                                    var doctorName = arr.doctorName ? arr.doctorName : '';                  //医生姓名
                                    var profLevelName = arr.profLevelName ? arr.profLevelName : '';         //医生职称
                                    var deptName = arr.deptName ? arr.deptName : '';                        //医生部门
                                    var hospName = arr.hospName ? arr.hospName : '';                        //医生医院

                                    var doctorFieldList = arr.doctorFieldList ? arr.doctorFieldList : '';   //医生擅长领域
                                    var doctorFieldListArr = '';
                                    var doctorFieldListLength = doctorFieldList.length;
                                    if(doctorFieldListLength > 4){
                                        doctorFieldList[4] = '更多';
                                    }

                                    if(doctorFieldList !== ''){
                                        for(var i=0;i<doctorFieldList.length;i++){
                                            var brr = doctorFieldList[i];
                                            if(!brr){
                                                continue;
                                            }

                                            if(i>4){
                                                continue;
                                            }

                                            doctorFieldListArr += '<span>' + brr + '</span>';
                                        }
                                    }

                                    var roomStatus = arr.roomStatus;                                        //诊室状态0关1开
                                    var rommFont = '暂不可预约';
                                    var rommStyle = 'doctorList-state-false';
                                    if(roomStatus === 0){
                                        rommFont = '暂不可预约';
                                        rommStyle = 'doctorList-state-false';
                                    }else{
                                        rommFont = '可预约';
                                        rommStyle = 'doctorList-state-true';
                                    }

                                    var price = arr.price;//价格

                                    result += '<div class="mui-content" ' +
                                        ' ng-click="goDetail(\'' + doctorId + '\', \'' + platformKey + '\');">' +
                                        '<div class="mui-card">' +
                                        '<ul class="mui-table-view">' +
                                        '<li class="mui-table-view-cell mui-media">' +
                                        '<a href="javascript:;">' +
                                        '<img class="mui-media-object mui-pull-left" src="' + headImg + '">' +
                                        '<div class="mui-media-body">' +
                                        '<div class="doctorList-doctor">' +
                                        '<div class="doctorList-doctor-name">' + doctorName + '</div>' +
                                        '<div>' + profLevelName + '</div>' +
                                        '<div>' + deptName + '</div>' +
                                        '</div>' +
                                        '<div class="doctorList-hospital">' +
                                        '<div>' + common.opStr(hospName, 12) + '</div>' +
                                        '</div>' +
                                        '<div class="doctorList-adept">' +
                                        '<div class="div-adept">擅长:</div>' +
                                        '<div class="div-adept-item">' +
                                        // '<span>超声心动图诊断</span>' +
                                        // '<span>股骨头坏死</span>' +
                                        // '<span>骨性关节炎</span>' +
                                        // '<span>晚期风湿类风湿性关节炎</span>' +
                                        doctorFieldListArr +
                                        '</div>' +
                                        '</div>' +
                                        '<div class="doctorList-order">' +
                                        '<div class="doctorList-state">线上预约状态:<span class="' + rommStyle + '">' + rommFont + '</span></div>' +
                                        '<div class="doctorList-money">￥ ' + price + '</div>' +
                                        '</div>' +
                                        '</div>' +
                                        '</a>' +
                                        '</li>' +
                                        '</ul>' +
                                        '</div>' +
                                        '</div>';
                                }

                                if(result === ''){
                                    result = '<div style="display: none;"></div>';
                                }

                                //动态生成的需要编译一下
                                var $html = $compile(result)($scope);

                                $('.doctorList-container').append($html);
                                me.resetload();
                            }

                        }else{
                            mui.toast('获取列表异常');
                        }

                        mui.hideLoading();
                    },
                    error:function (err) {
                        console.log(err);
                        mui.toast('获取列表异常');
                        mui.hideLoading();
                    }
                });

            }
        });
    };

    /**
     * 前往医生详情页面
     * @param doctorId
     * @param platformKey
     */
    $scope.goDetail = function (doctorId, platformKey) {
        window.location.href = 'doctorDetail.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&doctorId=' + doctorId +
            '&platformKey=' + platformKey;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //初始化分页
    $scope.initPage();

    /*******************************************************逻辑-end***********************************************************/

});