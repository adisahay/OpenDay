/* Used for case insensitive search in jquery contain selector */
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
	return function( elem ) {
		return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

var fileDetails = [];

function findIndexInData(data, property, value) {
	for(var i = 0, l = data.length ; i < l ; i++) {
		if(data[i][property] == value) {
			return i;
		}
	}
	return -1;
}

function showMatched(nodes) {
	for (i = 0; i < nodes.length; i++) {
		nodes[i].closest('.broadcast').style.display = 'table-row';
	}
}

function searchBroadcast(searchInput){
	$('.broadcast').hide();

	if ($('.broadcast').find('.title:Contains(' + searchInput + ')').length)
		showMatched($('.title:Contains(' + searchInput + ')').closest('.broadcast'));
}

function broadcastValidation(test) {
	var data;

	if (!$('#subject').val() || !$('#subject').val().trim()) {
		alert('Enter Email Subject.');
		$('#subject').val('');
		$('#subject').focus();
		return false;
	}

	if (!$('#emailText').summernote('code') || !$('#emailText').summernote('code').trim()) {
		alert('Enter Email Body.');
		$("#emailText").summernote('code');
		$('#emailText').summernote({focus: true});
		return false;
	}

	var email, blockUIMsg = 'Sending Emails.'
	if (test) {
		email = prompt('Please enter your Email Id.');
		if (!filter.test(email)) {
			alert('Enter Valid Email Id')
			return false;
		}
		blockUIMsg = 'Sending Test Email to ' + email;
	}

	data = {
		subject: $('#subject').val(),
		text: decodeURIComponent($("#emailText").summernote('code').trim().replace("%", "##per##___##cent##")),
		email: email,
		attachment: JSON.stringify(fileDetails)
	};
	$.blockUI({
		message: '<h1>' + blockUIMsg+ '. Hang tight...</h1>',
		css: {border: 'none', color: '#7a7a7a', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', 'border-radius': '10px'}
	});
	return data;
}

function reset() {
	$('#subject').val('').focus();
	$('#emailText').summernote('reset');
	fileDetails = [];
	$('#attachmentList').empty();
}

function formatBytes(bytes,decimals) {
	if(bytes == 0) return '0 Byte';
	var k = 1024,
		dm = decimals + 1 || 3,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));
	return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
}

function fileAttachment() {
	$.blockUI({
		message: '<h1>Processing attachment. Hang tight...</h1>',
		css: {border: 'none', color: '#7a7a7a', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', 'border-radius': '10px'}
	});
	var filesSelected = document.getElementById("file-upload").files;
	if (filesSelected.length > 0) {
		var fileToLoad = filesSelected[0],
			fileReader = new FileReader();
		fileReader.onload = function(fileLoadedEvent) {
			var targetFile = {
				type: fileToLoad.type,
				name: fileToLoad.name,
				content: fileLoadedEvent.target.result.split("base64,")[1]
			}

			fileDetails.push(targetFile);
			var index = fileDetails.length - 1;
			$('#attachmentList').append('<div id="' + index + '"><i class="fa fa-paperclip"></i>&nbsp;&nbsp;' + targetFile.name + '&nbsp;&nbsp;&nbsp;' + formatBytes(fileToLoad.size, 2) + '&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash" style="cursor: pointer;" onclick="deleteAttachment(' + index + ');"></i></div>');
			$.unblockUI();
		};
		fileReader.readAsDataURL(fileToLoad);
	}
}

function deleteAttachment(index){
	if (confirm("You're about to delete this attachment. Sure?")) {
		$('#' + index).remove();
		fileDetails.splice(index, 1);
	} else {
		return false;
	}
}

function sendEmail() {
	if (!broadcastValidation(0))
		return false;

	var data = {
		subject: $('#subject').val(),
		text: decodeURIComponent($("#emailText").summernote('code').trim().replace("%", "##per##___##cent##")),
		attachment: JSON.stringify(fileDetails)
	};

	console.log(data)
	$.ajax({
		type: "POST",
		cache: false,
		data: data,
		url: '/school/broadcastEmail',
		dataType: "json",
		success: function(res) {
			$.unblockUI();
			alert(res.message);
			reset();
		},
		error: function(xhr, textStatus, thrownError) {
			$.unblockUI();
			alert("Error in Launching Email. Try again.");
			console.log("Error in Launching Email. Try again.");
		}
	});
}

$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getBroadcasts('/school/getBroadcasts');

	$("#selectDate").datepicker({
		rtl: App.isRTL(),
		orientation: "right",
		autoclose: !0,
		format: "dd/mm/yyyy",
		todayHighlight: true
	}).on('changeDate', function(e) {
		vm.getAttendance('/school/getAttendance?date=' + e.date);
    });

	var d = new Date();
	$('#selectDate').val(d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear());

	$('#searchBroadcast').autocomplete({
		source: function(request, response) {
			searchBroadcast(request.term);
		},
		minLength: 0,
		open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
		},
		close: function() {
			$('#autocomplete').blur();
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
		}
	});

	$("#file-upload").change(fileAttachment);
});

function initAndBindViewModel() {

	var BroadcastViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.broadcastDetails = ko.observableArray([]);
		self.newBroadcast = ko.observable(new BroadcastDataModel());

		self.populateBroadcasts = function(broadcasts) {
			self.broadcastDetails([]);
			var array = self.broadcastDetails();
			$.each(broadcasts, function(index, value) {
				value.teacher = value.teacher?value.teacher:{name: 'Admin'};
				array.push(value);
			});

			self.broadcastDetails.valueHasMutated();
		};

		self.getBroadcasts = function(url) {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: url,
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateBroadcasts(res.broadcasts);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.broadcastDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.openBroadcastModal = function(broadcast){
			self.newBroadcast(new BroadcastDataModel(broadcast));
			self.newBroadcast.valueHasMutated();

			$.get('/school/getClassrooms', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					console.log(data)
					$('#broadcastModal').modal('show');
					//reset();
					$('#emailText').summernote({
						height: '250px',
						disableResizeEditor: true,
						dialogsInBody: true,
						onImageUpload: function(files) {
							$.blockUI({
								message: '<h1>Processing Image. Hang tight...</h1>',
								css: {border: 'none', color: '#7a7a7a', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', 'border-radius': '10px'}
							});
							var $editor = $(this),
								file = files[0];
							if (!file) {
								alert("select file.")
								return false;
							}
							sign_request(file, function(response) {
								upload(file, response.signed_request, response.url, function() {
									$editor.summernote('insertImage', response.url);
									$.unblockUI();
								})
							});
						}
					});
				}
			})
		};
	};

	var BroadcastDataModel = function(broadcast) {
		var self = this;
		self.newOrUpdate = ko.observable(true);
		self._id = ko.observable();
		self.subject = ko.observable();
		self.body = ko.observable();
		self.time = ko.observable();
		self.recipients = ko.observableArray();
		self.teacher = ko.observable();
		//self.classrooms = ko.observableArray();

		if (broadcast) {
			self.newOrUpdate(false);
			self._id(broadcast._id);
			self.subject(broadcast.subject);
			self.body(broadcast.body);
			self.time(broadcast.time);
			self.recipients(broadcast.recipients);
			self.teacher(broadcast.teacher);
			//self.classrooms(broadcast.classrooms);
		}
	};
	var vm = new BroadcastViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/school/broadcasts');
			break;
		default:
			// default code block
	}
}
