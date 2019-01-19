(function(){
    "use strict";
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var doc = document;

    // 找到静态文件引用的域名
    function _findDomain() {
        var path = null;
        var links = document.getElementsByTagName('link');
        var term = '.com';
        for (var n = links.length-1; n>-1; n--) {
            var href = links[n].href.replace(/\?.*$/, ''); // Strip any query param (CB-6007).
            var idx;
            if (href && (idx=href.indexOf(term))>-1) {
                // 遍历所有有href的link标签，匹配.com字符，提取静态域名
                // 举例: https://static.pay1pay.com/css/mch/index.css
                // 则返回 https://static.pay1pay.com/
                // 只要找到立即结束循环
                path = href.substring(0, (idx+4)) + '/';
                break;
            }
        }
        return path;
    }

    // 预加载图片，防止数字键盘空白的情况
    function _loadImgs() {
        // 图片的文件名，循环加载每张图片
        var keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 'delete','x'];
        keys.forEach(function(v, i, ary) {
            var img = new Image();
            img.src = _findDomain + 'img/lib/keyboard/' + v + '.png';
        })

    }

    function _extend(options){
        // 简单的json对象浅拷贝
        var newOptions = {};
        for (var key in defOptions) {
            if (hasOwnProperty.call(defOptions, key)) {
                // 保证不带出原生属性，如length, prototype之类的
                // 首选用户传入的参数值，然后默认值
                newOptions[key] = (options[key] === null || options[key] === undefined) ?
                    defOptions[key] : options[key];
            }
        }
        return newOptions;
    }

    // access className property while respecting SVGAnimatedString
    // 直接从zepto拷贝
    function _className(node, value){
        var klass = node.className || '',
            svg   = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // 直接从zepto拷贝
    function _classRE(className){
        return new RegExp('(^|\\s)' + className + '(\\s|$)');
    }

    // 直接从zepto拷贝
    function _hasClass(elem, className) {
        // className为单个类名
        var reg = _classRE(className);
        return reg.test(elem.className);
    }

    // 直接从zepto拷贝
    function _addClass(elem, className){
        // className可以传入多个类名以空格分开如 "class1 class2 class3"
        // 必须是元素类型且有className
        if (elem.nodeType!==1 || !("className" in elem)) {
            return;
        }
        // 添加类为空直接返回
        if (!className) return;
        var classList = [];
        className.split(/\s+/g).forEach(function(classItem){
            if (!_hasClass(elem, classItem)) {
                // 不存在方可添加传入的类名
                classList.push(classItem);
            }
        });
        var cls = _className(elem);
        classList.length && _className(elem, cls + (cls? " ":"")+ classList.join(" "));
    }

    // 直接从zepto拷贝
    function _removeClass(elem, className){
        // className可以传入多个类名以空格分开如 "class1 class2 class3"
        // 添加类为空直接返回
        if (!className) return;
        var cls = _className(elem);
        className.split(/\s+/g).forEach(function(classItem){
            cls = cls.replace(_classRE(classItem), " ");
        });

        _className(elem, cls.trim());
    }

    function _setNumBackground(elem, className){
        /// 使背景色有变化效果，单击发生变化
        _addClass(elem, className);
        setTimeout(function() { _removeClass(elem, className) }, 200);
    }

    // 滚动页面使键盘不要遮挡输入框, 次方法必须是键盘创建并显示后执行
    function _setInputVisiable(options){
        var input = doc.querySelector(options.selector);
        var keyboard = doc.querySelector("#" + options.numKeyboardId);

        //键盘高度
        var keyboardTop = keyboard.getBoundingClientRect().top + window.pageYOffset;

        //键盘实际高度
        var keyboardHeight = keyboard.offsetHeight;

        var pageHeight = doc.documentElement.clientHeight || doc.body.clientHeight;

        var inputBottom = input.getBoundingClientRect().bottom + window.pageYOffset;

        //元素相对高度
        var inputHeight = input.offsetHeight;

        //元素绝对高度
        var scrollHeight = $(options.selector).offset().top;

        // 当键盘顶部离页面顶部的高度小于输入框底部离页面顶部的高度时，需要填充以显示输入框
        if (keyboardTop < inputBottom) {
            var _numKeyboard_pad_div =doc.querySelector("#numKeyboard_pad_div");
            if (!_numKeyboard_pad_div) {
                var div = doc.createElement("div");
                div.id = "numKeyboard_pad_div";
                div.style.height = keyboardHeight + 'px';
                doc.body.appendChild(div);
            }
            _numKeyboard_pad_div =doc.querySelector("#numKeyboard_pad_div");
            // _numKeyboard_pad_div.style.paddingBottom = keyboardHeight-(pageHeight-inputBottom)+10 +"px";
            _numKeyboard_pad_div.style.display = 'block';
            // _numKeyboard_pad_div.style.visibility = 'hidden';
            // input.scrollIntoView();
            //加这个是为了让页面顶上去
            window.scrollTo(0, inputBottom - 100);

        }

    }

    var defOptions = {
        eventType:"touchstart",
        // num: 纯数字整数(键盘0-9), float：纯数字含小数（键盘0-9和小数点）, id：身份证（键盘0-9和字母X）
        numKeyboardType: "num",
        // *：表示不做任何格式处理,  数字表示分割位数，多个数字用空格隔开
        // 举个例子"6 8": 表示111111 11111111 111111111
        // "3 4": 表示111 1111 1111
        // 如果只传一个数字"4"：则每个4位空格分开1111 1111 1111 1111
        // 超过的位数不做任何处理,
        // 比如"6 8"超过了18位则不做任何处理 111111 11111111 11111111111111111...
        // "3 4": 表示111 1111 11111111111111111111111...
        format: "*",
        separator: "&nbsp;", // 分隔符
        max: 100,
        min: 10,
        decimal: 2,//小数点后几位
        //reg: /\d/, // 输入合法性验证
        selector:"", // 输入框选择器
        length: 50, // 长度限制，当输入长度达到此值时会回调callback函数
        callback: function(){},
        inputClass: "num-keyboard-input-blur", // 输入框blur类
        inputActiveClass: "num-keyboard-input-active", // 输入框focus类
        numKeyboardId: "num-keyboard", // 键盘id, 页面即使有多个输入框，也只有一个键盘，输入完成即销毁
        numKeyboardClass: "" // 键盘类
    };

    //预加载图片，防止数字键盘空白的情况
    //_loadImgs();

    // 组件入口
    function numKeyboard(options){
        /// options默认值{eventType:"click", selector:""}
        _init(_extend(options));
    }

    // 初始化
    function _init(options){
        // 没有绑定任何输入框则直接返回
        if (!options.selector || doc.querySelector(options.selector) === null) {
            return;
        }
        _inputInit(options);
        _bindInputEvent(options);
    }

    function _inputInit(options){
        // 初始化输入框， 设置placeholder的值, 还有输入框blur类名
        // 模拟输入框有三部分组成，数据，光标，清空按钮
        var input = doc.querySelector(options.selector);
        _addClass(input, "num-keyboard-input");
        var placeholder = input.getAttribute("placeholder");

        _addClass(input, options.inputClass);

        input.innerHTML = '<div class="num-keyboard-input-elem">'+ placeholder + '</div>' +
            '<div class="num-keyboard-input-cursor">|</div>' +
            '<div class="num-keyboard-input-empty"></div>';
        // var inputElem = input.querySelector(".num-keyboard-input-elem");

    }

    function _bindInputEvent(options){
        var input = doc.querySelector(options.selector);
        var inputElem = input.querySelector(".num-keyboard-input-elem");
        var placeholder = input.getAttribute("placeholder");

        /// 输入框获取到焦点的事件
        /// 兼容placeholder属性
        /// 然后显示
        input.addEventListener(options.eventType, function(e){
            e.stopPropagation();

            var targetElem = e.target;
            var targetClass = targetElem.className;

            // 当前元素获得焦点前，其他所有元素都要失去焦点
            var event = doc.createEvent("Events");
            event.initEvent(options.eventType, true, true);
            doc.body.dispatchEvent(event);

            // 清空输入框的内容
            if (targetClass === "num-keyboard-input-empty") {
                // input输入框的值要清空
                inputElem.innerHTML = "";
                input.setAttribute("val", "");
                /**************清空时，移动端会跑上去，先隐藏键盘解决****************/
                var numKeyboardPanel = doc.querySelector("#" + options.numKeyboardId);
                if(numKeyboardPanel) {
                    doc.body.removeChild(numKeyboardPanel);
                    numKeyboardPanel = null;
                }
                input.querySelector(".num-keyboard-input-cursor").style.display = 'block';
                //暂时隐藏
                //input.querySelector(".num-keyboard-input-empty").style.display = 'block';
                return false;
                /**************清空时，移动端会跑上去，先隐藏键盘解决****************/
            }

            // 显示当前输入框光标和清空图片按钮
            input.querySelector(".num-keyboard-input-cursor").style.display = 'block';
            //暂时隐藏
            //input.querySelector(".num-keyboard-input-empty").style.display = 'block';

            // 兼容placeholder
            var txt = inputElem.textContent.trim();
            if (txt === placeholder) {
                // 获得焦点时值为placeholder需要清空
                // 并且类名需要为激活状态
                inputElem.innerHTML = "";
                _removeClass(input,options.inputClass);
                _addClass(input, options.inputActiveClass);
            }

            // 显示键盘
            _createNumKeyboard(options);

            // 键盘不能遮挡输入框
            _setInputVisiable(options);

        }, false);

        /// 输入框失去焦点事件
        /// 单击键盘和输入框之外的其他地方即可隐藏键盘
        /// 兼容placeholder属性
        doc.body.addEventListener(options.eventType, function(e){
            e.stopPropagation();

            /*var isTrusted = e.isTrusted;
            //当为小数点键盘时
            if(isTrusted && options.numKeyboardType === 'float'){
                //获取输入的数字
                var targetElem = e.target;
                var inputVal = parseFloat(targetElem.innerText);

                //取得配置中的小数点后几位
                var decimal = options.decimal;
                //console.log(decimal);

                console.log(inputVal);

                //数字转成字符串
                var inputString = inputVal.toString();

                //对.的判断
                var dVal = inputString.indexOf('.');

                //当输入.时，对小数点后几位进行判断
                if(dVal !== -1){
                    var afterDecimal = inputString.split('.');
                    var decimalVal = afterDecimal[1];
                    var decimalLength = decimalVal.length;
                    //差值
                    var difference = decimal - decimalLength;
                    //console.log(difference);

                    var html = '';
                    for(var i=0;i<difference;i++){
                        html += '<span>0</span>';
                    }

                    //inputElem.append(html);

                    var inputNewVal = inputVal.toFixed(decimal);
                    input.setAttribute('val', inputNewVal);

                    //console.log(decimalLength);
                    if(decimalLength >= decimal){
                        //return false;
                    }
                }else{

                }

                console.log(input);
                //console.log(inputElem);
                //input.setAttribute('val', '###');

            }*/

            // 隐藏光标和清空图片按钮
            input.querySelector(".num-keyboard-input-cursor").style.display = 'none';
            //暂时隐藏
            //input.querySelector(".num-keyboard-input-empty").style.display = 'none';

            var _numKeyboard = doc.querySelector("#" + options.numKeyboardId);
            // 隐藏键盘
            _numKeyboard ? (_numKeyboard.style.display = 'none') : "";

            var _numKeyboard_pad_div = doc.querySelector("#numKeyboard_pad_div");
            _numKeyboard_pad_div ?  (_numKeyboard_pad_div.style.display = 'none') : "";

            var txt = inputElem.textContent.trim();
            if (!txt || txt===placeholder) {
                // 如果没有值则需要设置为placeholder的值
                // 同时类名设置为默认状态
                inputElem.innerHTML = placeholder;
                _removeClass(input,options.inputActiveClass);
                _addClass(input, options.inputClass);
            }

        }, false);

    }

    function _createNumKeyboard(options){
        var numKeyboardPanel = doc.querySelector("#" + options.numKeyboardId);
        if (numKeyboardPanel !== null) {
            // 清空已经创建过的键盘
            doc.body.removeChild(numKeyboardPanel);
            numKeyboardPanel = null;
        }

        var ul = doc.createElement("ul");
        ul.id = options.numKeyboardId;
        ul.className =  "num-keyboard" + (options.numKeyboardClass ? (" "+options.numKeyboardClass) : "");

        var tempLi = '';
        if (options.numKeyboardType === "num") {
            // 纯数字整数
            tempLi = '<li class="num-keyboard-item num-keyboard-item-empty"></li>';
        } else if (options.numKeyboardType === "float") {
            // 纯数字含小数
            tempLi = '<li class="num-keyboard-item num-keyboard-item-point" val=".">•</li>';
        } else {
            tempLi = '<li class="num-keyboard-item num-keyboard-item-x" val="X"></li>';
        }

        ul.innerHTML =   '<li class="num-keyboard-item num-keyboard-item1" val="1"></li>'
            +'<li class="num-keyboard-item num-keyboard-item2" val="2"></li>'
            +'<li class="num-keyboard-item num-keyboard-item3" val="3"></li>'
            +'<li class="num-keyboard-item num-keyboard-item4" val="4"></li>'
            +'<li class="num-keyboard-item num-keyboard-item5" val="5"></li>'
            +'<li class="num-keyboard-item num-keyboard-item6" val="6"></li>'
            +'<li class="num-keyboard-item num-keyboard-item7" val="7"></li>'
            +'<li class="num-keyboard-item num-keyboard-item8" val="8"></li>'
            +'<li class="num-keyboard-item num-keyboard-item9" val="9"></li>'
            + tempLi
            +'<li class="num-keyboard-item num-keyboard-item0" val="0"></li>'
            +'<li class="num-keyboard-item num-keyboard-back"></li>';

        document.body.appendChild(ul);

        _bindNumKeyboardEvent(options);
    }

    function _bindNumKeyboardEvent(options){
        // 事件绑定必须在创建数字键盘之后
        var numKeyboardPanel = doc.querySelector("#" + options.numKeyboardId);

        if (numKeyboardPanel === null) {
            // 数字键盘不存在
            return false;
        }

        var input = doc.querySelector(options.selector);
        var inputElem = input.querySelector(".num-keyboard-input-elem");

        //输入时的判断
        numKeyboardPanel.addEventListener(options.eventType, function(e){
            e.preventDefault();
            e.stopPropagation();

            var targetElem = e.target;
            var	targetClass = targetElem.className;
            var numKeyboardType = options.numKeyboardType;

            // 如果是数字键盘的无效键盘直接返回
            if (_hasClass(targetElem, "num-keyboard-item-empty")) {
                return false;
            }

            // 单击回退按钮
            if (_hasClass(targetElem, "num-keyboard-back")) {
                _setNumBackground(targetElem, "num-keyboard-back-active");

                // 回退input框中val属性的值
                var thisVal = input.getAttribute("val");

                if (thisVal) {
                    if (inputElem.lastElementChild && inputElem.lastElementChild.className !== "num-keyboard-input-space") {
                        // val有值且最后一个不是空格才可以删除
                        input.setAttribute("val", thisVal.substring(0, thisVal.length-1));
                        // 同时展示给用户看的数据也要回退
                        // 首先删除最后一个span
                        inputElem.removeChild(inputElem.lastElementChild);
                    }

                    // 然后再判断最后一个span是否为空格
                    // 如果是空格那么这个span也要删除
                    while (inputElem.lastElementChild && inputElem.lastElementChild.className === "num-keyboard-input-space") {
                        inputElem.removeChild(inputElem.lastElementChild);
                    }
                }

            } else {
                // 单击数字
                _setNumBackground(targetElem, "num-keyboard-item-active");

                //单击的值
                var val = targetElem.getAttribute("val");

                //已输入的值
                var inputVal =  input.getAttribute("val") || "";

                //对首值为0的判断
                if(inputVal === '0' && val !== '.'){
                    return false;
                }

                //最大值
                var max = options.max;

                //最小值
                var min = options.min;

                //小数点后几位的配置
                var decimal = options.decimal;

                //对.的判断
                var dVal = inputVal.indexOf('.');

                //当输入.时，对小数点后几位进行判断
                if(dVal !== -1){
                    var afterDecimal = inputVal.split('.');
                    var decimalVal = afterDecimal[1];
                    var decimalLength = decimalVal.length;

                    if(decimalLength >= decimal){
                        mui.toast('格式限定小数点后' + decimal + '位');
                        //alert('格式限定小数点后' + decimal + '位');
                        return false;
                    }
                }

                //当第一个输入的是.时
                if(dVal === -1 && val === '.' && inputVal.length === 0){
                    return false;
                }

                //输入多个.时
                if(dVal !== -1 && val === '.'){
                    return false;
                }

                // 验证数据输入的合法性, 不合法直接返回
                // if (!options.reg.test(inputVal+val)) {
                // 	return false;
                // }

                if (inputVal.length >= options.length) {
                    // 达到指定长度时，执行回调函数
                    typeof options.callback === "function" ? options.callback(input, inputVal) : "";

                    // 同时删除输入框
                    doc.body.removeChild(numKeyboardPanel);
                    numKeyboard = null;
                    return false;
                }

                //最后展示的值
                var inputNewVal = inputVal+val;

                //对最大值的判断
                if(inputNewVal > max && numKeyboardType !== 'id'){
                    mui.toast('最大值限定为' + max);
                    //alert('最大值限定为' + max);
                    return false;
                }

                //对最小值的判断
                if(inputNewVal < min && numKeyboardType !== 'id'){
                    mui.toast('最小值限定为' + min);
                    //alert('最小值限定为' + min);
                    return false;
                }

                // input的val值与格式无关, 展示给用户的值才需要格式
                input.setAttribute("val", inputNewVal);

                // 以下是设置输入数据的展示格式
                var format = options.format;
                var	separator = options.separator;

                // 格式为空或者*时表示不做处理
                if (!format || format === "*") {
                    inputElem.innerHTML = inputElem.innerHTML + '<span>' + val + '</span>';
                }

                var formatArr = format.split(" ");

                var preSeparator = "";
                var lastSeparator = "";

                if (formatArr.length < 1) {
                    return false;
                } else if (formatArr.length === 1) {
                    // 必须是数值
                    if (/\d/.test(formatArr[0])) {
                        // formatArr[0]的整数倍都需要添加分隔符
                        // 空格有可能放在前面，也有可能放在后面
                        // var preSeparator = "";
                        // var lastSeparator = "";
                        if ( inputVal && inputElem.lastElementChild &&
                            inputElem.lastElementChild.className !== "num-keyboard-input-space" &&
                            inputVal.length%parseInt(formatArr[0]) === 0) {
                            // 并且历史数据不为空，历史数据最后一位不是空格，并且符合规则
                            preSeparator = '<span class="num-keyboard-input-space">' + separator + '</span>';
                        }
                        if (inputNewVal && inputNewVal.length%parseInt(formatArr[0]) === 0) {
                            // 新数据不为空，并且符合规则
                            lastSeparator = '<span class="num-keyboard-input-space">' + separator + '</span>';
                        }

                        inputElem.innerHTML = inputElem.innerHTML + preSeparator + '<span>' + val + '</span>' + lastSeparator;
                    }
                } else {
                    var separatorPosArr =[];
                    for(var k = 0, len = formatArr.length; k < len; k++){
                        // 得到所有空格位置的数组, 假如formatArr=[6,8]
                        // 那么空格位置数组应该是[6,14], 以此类推
                        separatorPosArr[k] = (separatorPosArr[k-1] || 0) + parseInt(formatArr[k]);
                    }

                    // 根据位置判断是否需求添加分隔符
                    // 空格有可能放在前面，也有可能放在后面
                    // var preSeparator = "";
                    // var lastSeparator = "";
                    if ( inputVal && inputElem.lastElementChild &&
                        inputElem.lastElementChild.className !== "num-keyboard-input-space" &&
                        separatorPosArr.indexOf(inputVal.length)>-1) {
                        // 并且历史数据不为空，历史数据最后一位不是空格，并且符合规则
                        preSeparator = '<span class="num-keyboard-input-space">' + separator + '</span>';
                    }
                    if (inputNewVal && separatorPosArr.indexOf(inputNewVal.length) > -1) {
                        // 新数据不为空，并且符合规则
                        lastSeparator = '<span class="num-keyboard-input-space">' + separator + '</span>';
                    }
                    inputElem.innerHTML = inputElem.innerHTML + preSeparator + '<span>' + val + '</span>' + lastSeparator;
                }


            }

        }, false);

    }

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        // Expose numKeyboard as module.exports in loaders that implement the Node
        // module pattern (including browserify). Do not create the global, since
        // the user will be storing it themselves locally, and globals are frowned
        // upon in the Node module world.
        module.exports = numKeyboard;
    } else {
        // Register as a named AMD module, since numKeyboard can be concatenated with other
        // files that may use define, but not via a proper concatenation script that
        // understands anonymous AMD modules. A named AMD is safest and most robust
        // way to register. Lowercase numKeyboard is used because AMD module names are
        // derived from file names, and numKeyboard is normally delivered in a lowercase
        // file name. Do this after creating the global so that if an AMD module wants
        // to call noConflict to hide this version of numKeyboard, it will work.
        if ( typeof define === "function" && define.amd ) {
            define( "numKeyboard", [], function () { return numKeyboard; } );
        }
    }

    // If there is a window object, that at least has a document property,
    // define numKeyboard and $ identifiers
    if ( typeof window === "object" && typeof window.document === "object" ) {
        window.numKeyboard = numKeyboard;
    }

})();