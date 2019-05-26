function validateExistingUser(){
	var getData = {'username' : $("#re_un")[0].value};

	$.ajax({
		url: "/school/isUser",
		type: 'POST',
		dataType: 'json',
		data: getData,
		success: function(data){
			if(data.status != undefined ) {
				if(data.status == 100){
					$("#reg_error_message")[0].style.display = 'none'
					$("#register-submit-btn").attr('disabled',false);
					return;
				} else if(data.status == 200) {
					$("#register-submit-btn").attr('disabled',true);
					$("#reg_error_message")[0].innerHTML = "Account Already exist";
					$("#reg_error_message")[0].style.display = 'inherit'
					return;
				}
			}
		},
		error : function(err){
			console.log(err);
			$("#reg_error_message")[0].innerHTML = "Internal Server Error";
			$("#reg_error_message")[0].style.display = 'inherit'
		}
	});
}