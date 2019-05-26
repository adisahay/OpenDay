/* Used for case insensitive search in jquery contain selector */
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
	return function( elem ) {
		return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});

var selectedLanguages = [];

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

	if ($('.studentRow').find('.class > .classrooms option:selected:Contains(' + searchInput + ')').length)
		showMatched($('.class > .classrooms option:selected:Contains(' + searchInput + ')').closest('.studentRow'));
}

$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getStudents();

	$(document).on('change', '.anySiblings input', function(e) {
		var checked = this.checked ? $(this) : "";
		if ($(checked).attr("id") == 'no') {
			$('.anySiblings').removeClass('custom-modal-div');
			$('.siblingDetails, .addSiblings').hide();
		} else {
			$('.anySiblings').addClass('custom-modal-div');
			$('.siblingDetails, .addSiblings').show();
		}
	});

	$('#filters').multiselect({
		allSelectedText: 'All Classes Selected',
		nonSelectedText: 'Filter by Class',
		numberDisplayed: 3,
		nSelectedText: 'Classes Selected',
		buttonWidth: '100%',
		onChange: function(option, checked) {
			
		}
	});

	$('#studentModal').on('shown.bs.modal', function () {
		$('.page-footer').hide();
		$('#childName').focus();
		$("#dateofbirth, #dewormed, #annualMedical").datepicker({
			rtl: App.isRTL(),
			orientation: "left",
			autoclose: !0,
			format: "dd/mm/yyyy"
		})
	}).on("hidden.bs.modal", function () {
		$('.sd').click();
	});

	$(document).on('click', '.custom-modal-tab', function(){
		if ($(this).hasClass('sd')) {
			$('.fd > div, .hr > div').removeClass('active');
			$('.familyDetails, .healthRelated').hide();
			$('.sd > div').addClass('active');
			$('.studentDetails').show();
		} else if ($(this).hasClass('fd')) {
			$('.sd > div, .hr > div').removeClass('active');
			$('.studentDetails, .healthRelated').hide();
			$('.fd > div').addClass('active');
			$('.familyDetails').show();
		} else if ($(this).hasClass('hr')) {
			$('.sd > div, .fd > div').removeClass('active');
			$('.studentDetails, .familyDetails').hide();
			$('.hr > div').addClass('active');
			$('.healthRelated').show();
		}
	})

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

	var StudentViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.studentDetails = ko.observableArray([]);
		self.newStudent = ko.observable(new StudentDataModel());

		self.populateStudents = function(students, classrooms) {
			var temp = '';
			classrooms.forEach(function(c){
				temp += "<option value=" + c._id + ">" + c.name + "</option>";
			});

			self.studentDetails([]);
			var array = self.studentDetails();
			$.each(students, function(index, value) {
				value['rollNoCount'] = [];
				for (let m = 1; m <= classrooms[0].maxRollCount; m++) {
					value['rollNoCount'].push(m);
				}
				value['classrooms'] = classrooms;
				value['classRoom'] = value['classRoom']?value['classRoom']:'';
				value['dob'] = moment(new Date(value['dob'])).format('DD/MM/YYYY');
				console.log(value['health']['dewormed'])
				value['health']['dewormed'] = value['health']['dewormed']?moment(new Date(value['health']['dewormed'])).format('DD/MM/YYYY'):'';
				value['health']['annualMedical'] = value['health']['annualMedical']?moment(new Date(value['health']['annualMedical'])).format('DD/MM/YYYY'):'';
				array.push(value);
			});

			self.studentDetails.valueHasMutated();
			$('#filters').empty();
			$('#filters').append(temp);
			$('#filters').multiselect('rebuild');
		};

		self.getStudents = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/school/getStudents',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateStudents(res.students, res.classrooms);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.studentDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.validateSubmission = function(student) {
			if (!student.name()) {
				alert('Enter Student Name.');
				return false;
			} else if (!student.dob()) {
				alert('Select Date of Birth');
				return false;
			}

			return true;
		}

		self.classAssignOrChange = function(student) {
			var data = {
				_id: student._id,
				classRoom: student.classRoom
			};

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/assignOrUpdateStudentClass',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error') {
						console.log(res.err);
						$('.custom-notification-bottom').html(res.err.code + ' ' + res.errmsg).show();
					} else {
						$('.custom-notification-bottom').html('Successfully Assigned/Updated!').show();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.rollNoAssignOrChange = function(student) {
			var data = {
				_id: student._id,
				rollNo: student.rollNo
			};

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/assignOrUpdateStudentRollNo',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error') {
						console.log(res.err);
						$('.custom-notification-bottom').html(res.err.code + ' ' + res.errmsg).show();
					} else {
						$('.custom-notification-bottom').html('Successfully Assigned/Updated!').show();
					}

					setTimeout(function(){
						$('.custom-notification-bottom').fadeOut();
					}, 1500);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.openAddStudentModal = function() {
			$('.modal-title').html('New Student Onboarding');
			$('.fd, .hr').addClass('tabDisabled') // .css('pointer-events', 'none');
			self.newStudent(new StudentDataModel());
			self.newStudent.valueHasMutated();

			selectedLanguages = [];
			$.get('/admin/getLanguages', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					var temp = ''
					data.languages.forEach(function(l){
						temp += "<option value=" + l._id + ">" + l.name + "</option>";
					})
					$('#languages').append(temp);
					$('#languages').multiselect({
						nonSelectedText: 'Select Language',
						numberDisplayed: 4,
						nSelectedText: 'Languages Selected',
						buttonWidth: '100%',
						onChange: function(option, checked) {
							if (checked)
								selectedLanguages.push(option[0].value);
							else
								selectedLanguages.splice(selectedLanguages.indexOf(option[0].value), 1);
						}
					});
					$('#studentModal').modal({
						backdrop: 'static',
						keyboard: false
					})
				}
			})
		};

		self.addStudent = function() {
			var student = self.newStudent(),
				data = {
					name: student.name(),
					dob: new Date(moment(student.dob(), 'DD/MM/YYYY')),
					address: student.address(),
					phone: student.phone(),
					languages: selectedLanguages
				};

			if (!student.newOrUpdate())
				data._id = student._id();

			if (!self.validateSubmission(student))
				return false;

			$('.fd, .hr').removeClass('tabDisabled');

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: student.newOrUpdate() ? '/school/addStudent':'updateStudent?student=true',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.code + ' ' + res.errmsg);
					else if (res.message == 'Duplicate')
						alert('Student already exist');
					else {
						window._id = res._id;
						$('.sd > div').removeClass('active');
						$('.studentDetails').hide();
						$('.fd > div').addClass('active');
						$('.familyDetails').show();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.updateFamilyDetails = function() {
			var student = self.newStudent(),
				data = {
					_id: student._id()?student._id():window._id,
					family: {
						father: {
							name: student.family().father.name,
							occupation: student.family().father.occupation,
							designation: student.family().father.designation,
							officeAddress: student.family().father.officeAddress,
							phone: student.family().father.phone,
							emailId: student.family().father.emailId
						},
						mother: {
							name: student.family().mother.name,
							occupation: student.family().mother.occupation,
							designation: student.family().mother.designation,
							officeAddress: student.family().mother.officeAddress,
							phone: student.family().mother.phone,
							emailId: student.family().mother.emailId
						},
						siblings: student.family().siblings
					},
					email:[]
				};

			if (student.family().father.emailId)
				data.email.push({value: student.family().father.emailId, active: true})
			if (student.family().mother.emailId)
				data.email.push({value: student.family().mother.emailId, active: true})

			/*if (!self.validateSubmission(classroom))
				return false;*/

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/updateStudent?family=true',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.code + ' ' + res.errmsg);
					else {
						$('.fd > div').removeClass('active');
						$('.familyDetails').hide();
						$('.hr > div').addClass('active');
						$('.healthRelated').show();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.updateHealthDetails = function() {
			var student = self.newStudent(),
				data = {
					_id: student._id()?student._id():window._id,
					health: {
						emergency: {
							name: student.health().emergency.name,
							mobile: student.health().emergency.mobile
						},
						doctor: {
							name: student.health().doctor.name,
							mobile: student.health().doctor.mobile
						},
						immunization: [''],
						dewormed: new Date(moment(student.health().dewormed, 'DD/MM/YYYY')),
						annualMedical: new Date(moment(student.health().annualMedical, 'DD/MM/YYYY')),
						healthProblem: student.health().healthProblem,
						allergies: student.health().allergies,
						delivery: student.health().delivery,
					},
					specialNeed: student.specialNeed()
				};

			/*if (!self.validateSubmission(classroom))
				return false;*/

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/updateStudent?health=true',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.code + ' ' + res.errmsg);
					else {
						$('#studentModal').modal('hide');
						self.getStudents();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.openEditStudentModal = function(student){
			$('.modal-title').html('Edit Details');
			$('.fd, .hr').removeClass('tabDisabled');
			self.newStudent(new StudentDataModel(student));
			self.newStudent.valueHasMutated();

			selectedLanguages = [];
			$.get('/admin/getLanguages', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					var temp = '';
					languages = data.languages;
					languages.forEach(function(c){
						if (findIndexInData(student.languages, '_id', c._id) > -1) {
							temp += "<option selected value=" + c._id + ">" + c.name + "</option>";
							selectedLanguages.push(c._id);
						} else
							temp += "<option value=" + c._id + ">" + c.name + "</option>";
					})
					$('#languages').append(temp);
					$('#languages').multiselect({
						nonSelectedText: 'Select Language',
						numberDisplayed: 4,
						nSelectedText: 'Languages Selected',
						buttonWidth: '100%',
						onChange: function(option, checked) {
							if (checked)
								selectedLanguages.push(option[0].value);
							else
								selectedLanguages.splice(selectedLanguages.indexOf(option[0].value), 1);
						}
					});
					$('#studentModal').modal({
						backdrop: 'static',
						keyboard: false
					})
				}
			})
		};

		self.removeStudent = function(item) {
			var _id = {
				_id: item._id
			};

			var a = confirm("Are you sure you want to remove " + item.name + '?');

			if (!a)
				return false;

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/removeStudent',
				data: JSON.stringify(_id),
				contentType: "application/json",
				success: function(res){
					console.log(res)
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err);
					else
						self.reload();
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.getStudents();
		}
	};

	var StudentDataModel = function(student) {
		var self = this;
		self.newOrUpdate = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.rollNo = ko.observable();
		self.classRoom = ko.observable();
		self.dob = ko.observable();
		self.address = ko.observable();
		self.phone = ko.observable({
			residence: '',
			parent: ''
		});
		self.languages = ko.observableArray();

		self.family = ko.observable({
			father: {
				name: '',
				occupation: '',
				designation: '',
				officeAddress: '',
				phone: {
					office: '',
					mobile: ''
				},
				emailId: ''
			},
			mother: {
				name: '',
				occupation: '',
				designation: '',
				officeAddress: '',
				phone: {
					office: '',
					mobile: ''
				},
				emailId: ''
			},
			siblings: [{name: '', age: ''}]
		});
		self.health = ko.observable({
			emergency: {
				name: '',
				mobile: ''
			},
			doctor: {
				name: '',
				mobile: ''
			},
			immunization: [''],
			dewormed: '',
			annualMedical: '',
			healthProblem: '',
			allergies: '',
			delivery: '',
		});
		self.specialNeed = ko.observable();
		self.classrooms = ko.observableArray();
		self.rollNoCount = ko.observableArray();

		if (student) {
			self.newOrUpdate(false);
			self._id(student._id);
			self.name(student.name);
			self.rollNo(student.rollNo);
			self.classRoom(student.classRoom);
			self.dob(student.dob);
			self.address(student.address);
			self.phone(student.phone);
			self.languages(student.languages);
			self.family(student.family);
			self.health(student.health);
			self.specialNeed(student.specialNeed);
			self.classrooms(student.classrooms);
			self.rollNoCount(student.rollNoCount);
		}
	};
	var vm = new StudentViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/school/students');
			break;
		default:
			// default code block
	}
}
