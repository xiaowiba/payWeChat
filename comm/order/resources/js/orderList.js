commApp.controller('orderListController', function ($scope, $state, $http, $filter, $timeout, $sce, $compile) {
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
        $scope.isHaveUnpaid = false;//是否有待付款数量
        $scope.pageIndex = 1;
        $scope.pageSize = 5;

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

    //初始化订单数量
    $scope.initNum = function () {
        $.ajax({
            async: false,
            method: 'post',
            url:$scope.addaUrl + '/rest/consult/myOrderCount',
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
                $scope.total = data.total;                 //全部数量
                $scope.noPayount = data.noPayount;         //待付款
                $scope.noReplyeCount = data.noReplyeCount; //待回复
                $scope.completeCount = data.completeCount; //已完成
                $scope.closeCount = data.closeCount;       //已关闭

                if($scope.noPayount > 0){
                    $scope.isHaveUnpaid = true;
                }else{
                    $scope.isHaveUnpaid = false;
                }

                if($scope.noPayount > 99){
                    $('#noPayount').css('width', '25px');
                }

                mui.hideLoading();

            },
            error:function (err) {
                console.log(err);
                mui.toast('获取数量异常');
                mui.hideLoading();
            }
        });
    };

    $scope.initPage = function () {
        var itemIndex = 0;

        var tabLoadEndArray = [false, false, false, false, false];
        //var tabLenghtArray = [1, 11, 3, 1, 2];
        var tabScroolTopArray = [0, 0, 0, 0, 0];

        var dropload = $('.khfxWarp').dropload({
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
                    url:$scope.addaUrl + '/rest/consult/myOrderList',
                    data:{
                        patientId:$scope.patientId,
                        patientPlatformKey:$scope.patientPlatformKey,
                        type:itemIndex,
                        pageIndex:$scope.pageIndex,
                        pageSize:$scope.pageSize
                    },
                    success:function (Data) {
                        var data = Data.data.showList;
                        var length = data.length;

                        if(Data.result === 200){

                            if (length === 0) {
                                me.lock();//锁定
                                me.noData();//无数据
                                me.resetload();//重置

                                return false;
                            }else{
                                $scope.pageIndex ++;

                                var result = '';
                                for (var index = 0; index < length; index++) {
                                    var arr = data[index];
                                    var orderID = arr.orderID;          //订单ID
                                    var out_trade_no = arr.out_trade_no;//订单编号
                                    var doctorName = arr.doctorName;    //问诊医生
                                    var total_fee = arr.total_fee;      //付款金额
                                    var time_end = arr.time_end;        //支付时间
                                    var moreTime = arr.moreTime;        //追问时间
                                    var state = arr.state;              //订单状态
                                    var type = arr.type;                //订单类型:0全部1待付款2待回复3已完成4已关闭5待查看6退款中
                                    var contentType = arr.contentType;  //回复状态:1正常无回复2正常有回复3追问无回复4追问有回复5正常待查看6追问待查看7超时关闭8退款关闭9退款中

                                    var style = '';
                                    switch (state) {
                                        case '待付款':
                                            style = 'red';
                                            break;
                                        case '待查看':
                                            style = 'red';
                                            break;
                                        case '待回复':
                                            style = 'red';
                                            break;
                                        case '退款中':
                                            style = 'red';
                                            break;
                                        case '已完成':
                                            style = 'blue';
                                            break;
                                        case '已关闭':
                                            style = 'gray';
                                            break;
                                    }

                                    //追问的判断
                                    if(contentType === 3 || contentType === 4 || contentType === 6){
                                        result += '<div class="mui-content" ng-click="goDetail(\'' + orderID + '\', \'' + type + '\', \'' + contentType + '\');">' +
                                            '' +
                                            '            <div class="mui-card">' +
                                            '' +
                                            '                <ul class="mui-table-view">' +
                                            '' +
                                            '                    <li class="mui-table-view-cell">' +
                                            '                        <a href="javascript:;">' +
                                            '                            <div class="mui-media-body">' +
                                            '' +
                                            '                                <div class="orderList-doctor">' +
                                            '                                    <div class="doctor-label">问诊医生：</div>' +
                                            '                                    <div class="doctor-name">' + doctorName + '</div>' +
                                            '                                    <div class="order-state ' + style + '">' + state + '</div>' +
                                            '                                </div>' +
                                            '' +
                                            '                                <div class="orderList-order">' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">付款金额</div>' +
                                            '                                        <div class="order-value orange">￥ 0</div>' +
                                            '                                    </div>' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">订单编号</div>' +
                                            '                                        <div class="order-value f12">' + out_trade_no + '</div>' +
                                            '                                    </div>' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">追问时间</div>' +
                                            '                                        <div class="order-value">' + moreTime + '</div>' +
                                            '                                    </div>' +
                                            '                                </div>' +
                                            '' +
                                            '                            </div>' +
                                            '                        </a>' +
                                            '                    </li>' +
                                            '' +
                                            '                </ul>' +
                                            '' +
                                            '            </div>' +
                                            '        </div>';

                                    }else{
                                        //其他状态
                                        result += '<div class="mui-content" ng-click="goDetail(\'' + orderID + '\', \'' + type + '\', \'' + contentType + '\');">' +
                                            '' +
                                            '            <div class="mui-card">' +
                                            '' +
                                            '                <ul class="mui-table-view">' +
                                            '' +
                                            '                    <li class="mui-table-view-cell">' +
                                            '                        <a href="javascript:;">' +
                                            '                            <div class="mui-media-body">' +
                                            '' +
                                            '                                <div class="orderList-doctor">' +
                                            '                                    <div class="doctor-label">问诊医生：</div>' +
                                            '                                    <div class="doctor-name">' + doctorName + '</div>' +
                                            '                                    <div class="order-state ' + style + '">' + state + '</div>' +
                                            '                                </div>' +
                                            '' +
                                            '                                <div class="orderList-order">' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">付款金额</div>' +
                                            '                                        <div class="order-value orange">￥ ' + total_fee + '</div>' +
                                            '                                    </div>' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">订单编号</div>' +
                                            '                                        <div class="order-value f12">' + out_trade_no + '</div>' +
                                            '                                    </div>' +
                                            '                                    <div class="order-item">' +
                                            '                                        <div class="order-label">支付时间</div>' +
                                            '                                        <div class="order-value">' + time_end + '</div>' +
                                            '                                    </div>' +
                                            '                                </div>' +
                                            '' +
                                            '                            </div>' +
                                            '                        </a>' +
                                            '                    </li>' +
                                            '' +
                                            '                </ul>' +
                                            '' +
                                            '            </div>' +
                                            '        </div>';
                                    }

                                }

                                if(result === ''){
                                    result = '<div style="display: none;"></div>';
                                }

                                //动态生成的需要编译一下
                                var $html = $compile(result)($scope);

                                $('.khfxPane').eq(itemIndex).append($html);
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


        $('.tabHead span').on('click', function () {
            var container = $('.khfxPane');
            //先清空数据，不然数据会重复
            container.html('');

            //初始化页码，否则页面数据会异常
            $scope.pageIndex = 1;

            tabScroolTopArray[itemIndex] = $(window).scrollTop();
            var $this = $(this);
            itemIndex = $this.index();
            $(window).scrollTop(tabScroolTopArray[itemIndex]);

            $(this).addClass('active').siblings('.tabHead span').removeClass('active');
            $('.tabHead .borders').css('left', $(this).offset().left + 'px');
            container.eq(itemIndex).show().siblings('.khfxPane').hide();

            if (!tabLoadEndArray[itemIndex]) {
                dropload.unlock();
                dropload.noData(false);
            } else {
                dropload.lock('down');
                dropload.noData();
            }

            dropload.resetload();
        });
    };

    /**
     *
     * @param orderID
     * @param type
     * @param contentType
     */
    $scope.goDetail = function (orderID, type, contentType) {
        if(type == 1){
            window.location.href = '../consult/consult.html' +
                '?account=' + $scope.account +
                '&openId=' + $scope.openId +
                '&orderID=' + orderID;
        }else{
            window.location.href = '../order/orderDetail.html' +
                '?account=' + $scope.account +
                '&openId=' + $scope.openId +
                '&orderID=' + orderID +
                '&type=' + type +
                '&contentType=' + contentType;
        }

    };

    /*******************************************************方法-end***********************************************************/

    /*******************************************************逻辑-start***********************************************************/
    //初始化数据
    $scope.INIT();

    //初始化订单数量
    $scope.initNum();

    //初始化分页
    $scope.initPage();

    /*******************************************************逻辑-end***********************************************************/

});