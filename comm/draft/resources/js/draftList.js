commApp.controller('draftListController', function ($scope, $state, $http, $filter, $timeout, $sce, $compile) {
    //mui.showLoading('正在加载..', 'div');

    /*******************************************************方法-start***********************************************************/
    //初始化数据
    $scope.INIT = function () {
        $scope.account = common.getUrlParam('account');
        $scope.openId = common.getUrlParam('openId');
        $scope.pageIndex = 1;
        $scope.pageSize = 5;

        $.ajax({
            async: false,
            method: 'get',
            url:'../personal/resources/json/infoCount.json',
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

    //初始化分页
    $scope.initPage = function () {
        $(function () {

            var itemIndex = 0;
            var tabLoadEndArray = [false];
            var tabLenghtArray = [6];

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
                        url:'../draft/resources/json/draftList.json',//$scope.addaUrl + '/rest/consult/draftList',
                        data:{
                            patientId:$scope.patientId,
                            patientPlatformKey:$scope.patientPlatformKey,
                            pageIndex:$scope.pageIndex,
                            pageSize:$scope.pageSize
                        },
                        success:function (Data) {
                            var data = Data.data;
                            var consultOrdeList = data.consultOrdeList;
                            var length = consultOrdeList.length;

                            if(Data.result === 200){

                                if (length === 0 || $scope.pageIndex === 3) {
                                    me.lock();
                                    me.noData();
                                    me.resetload();
                                    return false;
                                }else{
                                    $scope.pageIndex ++;

                                    var result = '';
                                    for (var index = 0; index < length; index++) {
                                        var arr = consultOrdeList[index];
                                        var orderID = arr.orderID;          //订单ID
                                        var patientName = arr.patientName;  //问诊人
                                        var doctorName = arr.doctorName;    //问诊医生
                                        var cont = arr.cont;                //问诊内容
                                        var addTime = (arr.addTime).substring(0, 10);//保存草稿时间

                                        result += '<div class="mui-content" ng-click="goDetail(\'' + orderID + '\');">' +
                                            '' +
                                            '        <div class="mui-card">' +
                                            '' +
                                            '            <ul class="mui-table-view">' +
                                            '' +
                                            '                <li class="mui-table-view-cell mui-media">' +
                                            '                    <a href="javascript:;">' +
                                            '                        <div class="mui-media-body">' +
                                            '' +
                                            '                            <div class="draftList-item">' +
                                            '                                <div class="draftList-label">问诊医生</div>' +
                                            '                                <div class="draftList-value">' + doctorName + '</div>' +
                                            '                            </div>' +
                                            '                            <div class="draftList-item">' +
                                            '                                <div class="draftList-label">问诊人</div>' +
                                            '                                <div class="draftList-value">' + patientName + '</div>' +
                                            '                            </div>' +
                                            '                            <div class="draftList-item">' +
                                            '                                <div class="draftList-label">问诊内容</div>' +
                                            '                                <div class="draftList-value yiChu">' + cont + '</div>' +
                                            '                            </div>' +
                                            '                            <div class="draftList-item">' +
                                            '                                <div class="draftList-label">保存草稿时间</div>' +
                                            '                                <div class="draftList-value">' + addTime + '</div>' +
                                            '                            </div>' +
                                            '' +
                                            '                        </div>' +
                                            '                    </a>' +
                                            '                </li>' +
                                            '' +
                                            '            </ul>' +
                                            '' +
                                            '        </div>' +
                                            '    </div>';
                                    }

                                    if(result === ''){
                                        result = '<div style="display: none;"></div>';
                                    }

                                    //动态生成的需要编译一下
                                    var $html = $compile(result)($scope);

                                    $('.draftList-container').append($html);
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

        });
    };

    $scope.goDetail = function (orderID) {
        window.location.href = '../consult/consult.html' +
            '?account=' + $scope.account +
            '&openId=' + $scope.openId +
            '&orderID=' + orderID;
    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //初始化分页
    $scope.initPage();

    /*******************************************************逻辑-end***********************************************************/

});