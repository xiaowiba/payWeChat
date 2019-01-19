/*
 * 此插件用于医患交流项目中医生回复页面中的评价插件
 * WECHAT-Java\src\main\webapp\views\H5\comm\reply\reply.html
 */
;
(function ($, window, document, undefined) {
    var Marking = function (ele, opt) {
        this.$element = ele;
        this.defaults = {
            'height': 20,
            'width': 20,
            'spaceBetween': 2,
            'backgroundImageInitial': 'images/star_hollow.png', //图标初始样式
            'backgroundImageOver': 'images/star_solid.png', //点击后图标
            'num': 5, //图标数量
            'havePoint': false, //是否有小数
            'haveGrade': false, //是否有分数
            'unit': '', //单位内容
            'grade': 0 //分数
        };
        this.options = $.extend({}, this.defaults, opt);
    };

    //定义Marking的方法
    Marking.prototype = {
        setImages: function () {
            var htmlItem = '<div class="set_image_item"><img style="height:100%;" src="' + this.options.backgroundImageInitial + '" alt=""></div>';
            var htmlAll = '';
            for (var i = 0; i < this.options.num; i++) {
                htmlAll = htmlItem + htmlAll;
            }
            var html = '<div class="set_image_all">' + htmlAll + '</div>';
            return this.$element.append(html);
        },
        //初始状态
        begin: function () {
            var that = this.$element;
            var This = this;
            var grade = this.options.grade;
            if (This.options.haveGrade) {
                that.append('<span class="grade">' + grade + '&nbsp;' + This.options.unit + '</span>');
                that.find('.grade').css({
                    'display': 'inline-block',
                    'height': This.options.height + 'px',
                    'line-height': This.options.height + 'px'
                })
            }
            //console.log( This.options.height);
            that.find('.set_image_item').css({
                'height': This.options.height + 'px',
                'width': This.options.width + 'px'
            });
            var htmlTop = '';
            console.log(Math.ceil(grade));
            for (var i = 0; i <Math.ceil(grade); i++) {
                htmlTop = htmlTop + '<div><img style="height:100%;" src="' + This.options.backgroundImageOver + '" alt=""></div>';
            }
            that.find('.set_image_all').append('<div class="set_image_top">' + htmlTop + '</div>');
            that.find('.set_image_top>div').css({
                'height': This.options.height + 'px',
                'width': This.options.width + 'px'
            });
            if((This.options.havePoint)&&(grade%1!=0)){
                that.find('.set_image_top>div').last().css({
                    'width': This.options.width * (grade -  Math.floor(grade)) + 'px'
                });
            }
        },
        // 点击改变显示
        clickChangeAll: function () {
            var that = this.$element;
            var This = this;
            var grade = this.options.grade;
            that.find('.set_image_item').click(function(e) {
                grade = $(this).index() + 1;
                // console.log(grade)
                that.find('.set_image_top').remove();
                var htmlTop = '';
                for (var i = 0; i <= $(this).index(); i++) {
                    htmlTop = htmlTop + '<div><img style="height:100%;" src="' + This.options.backgroundImageOver + '" alt=""></div>';
                }
                that.find('.set_image_all').append('<div class="set_image_top">' + htmlTop + '</div>');
                that.find('.set_image_top>div').css({
                    'height': This.options.height + 'px',
                    'width': This.options.width + 'px',
                    'margin-right': This.options.spaceBetween + 'px'
                });
                // 判断需要小数
                if (This.options.havePoint) {
                    var X1 = e.pageX - $(this).offset().left;
                    console.log(X1);
                    that.find('.set_image_top>div').last().css({
                        'width': X1 + 'px'
                    });
                    grade = grade + X1 / This.options.width - 1;
                    grade = grade.toFixed(1);
                }
                // 添加分数
                if (This.options.haveGrade) {
                    //分值为0~10分
                    grade = grade*2;
                    that.find('.grade').remove();
                    that.append('<span class="grade">' + grade + '&nbsp' + This.options.unit + '</span>');
                    that.find('.grade').css({
                        'display': 'inline-block',
                        'height': This.options.height + 'px',
                        'line-height': This.options.height + 'px'
                    });
                }
                //在页面中保存数值结果
                $('#evaluateResult').val(grade);
                console.log(grade);
            });

        },
        // 添加样式
        myCss: function () {
            $('.set_image_item').parent().css({
                'display': 'inline-block'
            });
            $('.set_image_item').css({
                'margin-right': this.options.spaceBetween + 'px'
            });
            $('.set_image_top>div').css({
                'margin-right': this.options.spaceBetween + 'px'
            });
        }
    };
    //在插件中使用markingSystem对象
    $.fn.markingSystem = function (options) {
        //创建Beautifier的实体
        var marking = new Marking(this, options);
        //调用其方法
        marking.setImages();
        marking.begin();
        marking.clickChangeAll();
        return marking.myCss();
    }
})(jQuery, window, document);