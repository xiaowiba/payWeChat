//需要定义云盘Host地址uploadUrl和token令牌
var account = common.getUrlParam("account");
var openId = common.getUrlParam("openId");
var target = $('#target');
$("input[type=file]").on("change", function () {
	var size = $(this)[0].files[0].size;
	if (size > 100 * 1024 * 1024) {
		alert('上传文件不能大于100MB');
	} else {
		target.loadingOverlay();
		console.log($("input[type=file]")[0].files[0]);
		var formData = new FormData();
		formData.append("file", $("input[type=file]")[0].files[0]);
		$.ajax({
			type: 'post',
			url: "/medicalH5Api/" + account + "/" + openId + "/upload",
			data: formData,
			processData: false,
		    contentType: false,
			success: function (json) {
				target.loadingOverlay('remove');
				var url = window.location.href;
				window.location.href = url + "?id=" + 10000 * Math.random();
			}
		})
	}	
});

$("#chooseFile").on("click", function () {
	$("input[type=file]").trigger("click");	
});