function saveSchool() {
	var school = {
		name: $('#schoolName').val(),
		contact: {
			phone: [$('#contactNo').val(), $('#altContact').val()],
			email: $('#emailId').val()
		},
		address: {
			fulladdress: $('#fulladdress').val(),
			city: $('#city').val(),
			state: $('#state').val(),
			postal_code: $('#postal_code').val(),
		},
		owner: {
			name: $('#owner').val(),
			phone: $('#ownerContact').val()
		},
		principal: {
			name: $('#principal').val(),
			phone: $('#principalContact').val()
		}
	};

	Metronic.blockUI();
	$.ajax({
		type: "POST",
		cache: false,
		url: '/school/saveSchool',
		data: JSON.stringify(school),
		contentType: "application/json",
		success: function(res){
			Metronic.unblockUI();
			if (res.message == 'error')
				alert(res.err.code + ' ' + res.errmsg);
			else {
				getSchool();
			}
		},
		error: function(){
			Metronic.unblockUI();
		}
	});
}

function populate(school) {
	$('#schoolName').val(school.name);
	$('#contactNo').val(school.contact?(school.contact.phone?school.contact.phone[0]:''):'');
	$('#altContact').val(school.contact?(school.contact.phone?school.contact.phone[1]:''):'');
	$('#emailId').val(school.contact.email);
	$('#fulladdress').val(school.address?school.address.fulladdress:'');
	$('#city').val(school.address?school.address.city:'');
	$('#state').val(school.address?school.address.state:'');
	$('#postal_code').val(school.address?school.address.postal_code:'');
	$('#owner').val(school.owner?school.owner.name:'');
	$('#ownerContact').val(school.owner?school.owner.phone:'');
	$('#principal').val(school.principal?school.principal.name:'');
	$('#principalContact').val(school.principal?school.principal.phone:'');
}

function getSchool() {
	Metronic.blockUI({
		target: '#blockui_portlet_body',
		boxed: true
	});

	$.ajax({
		type: "GET",
		cache: false,
		url: '/school/getSchool',
		dataType: "json",
		success: function(res){
			Metronic.unblockUI();
			if(res.message == 'success') {
				populate(res.school);
			} else if (res.message == 'error')
				alert('Error: ' + res.err);
		},
		error: function(){
			Metronic.unblockUI();
		}
	});
};

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function() {
	getSchool();

	$(document).on('click', '#saveSchool', saveSchool);

	if (getParameterByName('f') == 0) {
		$('.custom-notification-bottom').show();
		setTimeout(function(){
			$('.custom-notification-bottom').hide();
		}, 2000);
	} else
		$('.custom-notification-bottom').hide();
});
