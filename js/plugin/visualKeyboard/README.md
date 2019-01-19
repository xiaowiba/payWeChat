# visualKeyboard 移动端虚拟键盘
移动端虚拟键盘， 支持类型： num: 纯数字整数(键盘0-9), float：纯数字含小数（键盘0-9和小数点）, id：身份证（键盘0-9和字母X）

# 页面中引入，css，js
参考index.html

# 页面初始化后生成虚拟键盘api
    参考index.html
    // 页面初始化后执行    
		numKeyboard({
			eventType:"touchstart", 
			// num: 纯数字整数(键盘0-9), float：纯数字含小数（键盘0-9和小数点）, id：身份证（键盘0-9和字母X）
			numKeyboardType: "num", 
			// *：表示不做任何格式处理,  数字表示分割位数，多个数字用空格隔开
			// 举个例子"6 8": 表示111111 11111111 1111
			// "3 4": 表示111 1111 1111
			// 如果只传一个数字"4"：则每个4位空格分开1111 1111 1111 1111
			// 超过的位数不做任何处理, 
			// 比如"6 8"超过了18位则不做任何处理 111111 11111111 11111111111111111...
			// "3 4": 表示111 1111 11111111111111111111111...
			format: "4", 
			separator: "&nbsp;", // 分隔符
			selector:"#card-no", 
			length: 5,
			callback: function(input, inputVal){
				alert(inputVal);
			},
			inputClass: "num-keyboard-input-blur",
			inputActiveClass: "num-keyboard-input-active",
			numKeyboardId: "num-keyboard", 
			numKeyboardClass: ""
		});
		numKeyboard({
			eventType:"touchstart", 
			// num: 纯数字整数(键盘0-9), float：纯数字含小数（键盘0-9和小数点）, id：身份证（键盘0-9和字母X）
			numKeyboardType: "id", 
			// *：表示不做任何格式处理,  数字表示分割位数，多个数字用空格隔开
			// 举个例子"6 8": 表示111111 11111111 1111
			// "3 4": 表示111 1111 1111
			// 如果只传一个数字"4"：则每个4位空格分开1111 1111 1111 1111
			// 超过的位数不做任何处理, 
			// 比如"6 8"超过了18位则不做任何处理 111111 11111111 11111111111111111...
			// "3 4": 表示111 1111 11111111111111111111111...
			format: "6 8", 
			separator: "&nbsp;", // 分隔符
			length: 18,
			callback: function(input, inputVal){
				alert(inputVal);
			},
			selector:"#identify-no", 
			inputClass: "num-keyboard-input-blur",
			inputActiveClass: "num-keyboard-input-active",
			numKeyboardId: "num-keyboard", 
			numKeyboardClass: ""
		});
    
# 获取输入后的值
		document.getElementById("get-val").addEventListener("touchstart", function(){
    // 获取输入后的值，只需要取输入框的val属性即可
		alert(document.getElementById("card-no").getAttribute("val"));
		alert(document.getElementById("identify-no").getAttribute("val"));
		}, false);
