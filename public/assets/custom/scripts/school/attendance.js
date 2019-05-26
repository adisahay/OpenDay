/* Used for case insensitive search in jquery contain selector */
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
	return function( elem ) {
		return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

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
		nodes[i].closest('.studentRow').style.display = 'table-row';
	}
}

function searchStudent(searchInput){
	$('.studentRow').hide();

	if ($('.studentRow').find('.name:Contains(' + searchInput + ')').length)
		showMatched($('.name:Contains(' + searchInput + ')').closest('.studentRow'));

	if ($('.studentRow').find('.class:Contains(' + searchInput + ')').length)
		showMatched($('.class:Contains(' + searchInput + ')').closest('.studentRow'));
}

$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getAttendance('/school/getAttendance');

	$('#filters').multiselect({
		allSelectedText: 'All Classes Selected',
		nonSelectedText: 'Filter by Class',
		numberDisplayed: 3,
		nSelectedText: 'Classes Selected',
		buttonWidth: '100%',
		onChange: function(option, checked) {
			
		}
	});

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

	$('#searchStudent').autocomplete({
		source: function(request, response) {
			searchStudent(request.term);
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
});

function initAndBindViewModel() {

	var AttendanceViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.attendanceDetails = ko.observableArray([]);
		self.newStudent = ko.observable(new StudentDataModel());

		self.populateAttendance = function(attendance, classrooms) {
			var temp = '';
			classrooms.forEach(function(c){
				temp += "<option value=" + c._id + ">" + c.name + "</option>";
			});

			self.attendanceDetails([]);
			var array = self.attendanceDetails();
			$.each(attendance, function(index, value) {
				array.push(value);
			});

			self.attendanceDetails.valueHasMutated();
			$('#filters').empty();
			$('#filters').append(temp);
			$('#filters').multiselect('rebuild');
		};

		self.getAttendance = function(url) {
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
						self.populateAttendance(res.attendance, res.classrooms);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.attendanceDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};
	};

	var StudentDataModel = function(student) {
		var self = this;
		self.newOrUpdate = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.rollNo = ko.observable();
		self.classRoom = ko.observable();
		self.classrooms = ko.observableArray();

		if (student) {
			self.newOrUpdate(false);
			self._id(student._id);
			self.name(student.name);
			self.rollNo(student.rollNo);
			self.classRoom(student.classRoom);
			self.classrooms(student.classrooms);
		}
	};
	var vm = new AttendanceViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/school/attendance');
			break;
		default:
			// default code block
	}
}
