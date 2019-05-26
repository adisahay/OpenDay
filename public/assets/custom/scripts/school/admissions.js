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
}

$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.appliedForAdmission();
	vm.getEnquiryList();

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
		allSelectedText: 'All Options Selected',
		nonSelectedText: 'Status',
		numberDisplayed: 3,
		nSelectedText: 'options Selected',
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

	var AdmissionViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.studentDetails = ko.observableArray([]);
		self.newStudent = ko.observable(new AdmissionModel());
		self.enquiryDetails = ko.observableArray([]);
		self.newEnquiry = ko.observable(new EnquiryModel());

		self.populateAdmissionRequests = function(students) {

			self.studentDetails([]);
			var array = self.studentDetails();
			$.each(students, function(index, value) {
				value['status'] = 'Form Submitted';
				if (value['status'] == 1)
					value['status'] = 'Not Eligible';
				else if (value['status'] == 2)
					value['status'] = 'Eligible';
				else if (value['status'] == 3)
					value['status'] = 'Rejected';
				else if (value['status'] == 4)
					value['status'] = 'Approved';
				else if (value['status'] == 5)
					value['status'] = 'Left School';

				value['dob'] = moment(new Date(value['dob'])).format('DD/MM/YYYY');
				value['health']['dewormed'] = moment(new Date(value['health']['dewormed'])).format('DD/MM/YYYY');
				value['health']['annualMedical'] = moment(new Date(value['health']['annualMedical'])).format('DD/MM/YYYY');
				array.push(value);
			});

			self.studentDetails.valueHasMutated();
		};

		self.appliedForAdmission = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/school/appliedForAdmission',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateAdmissionRequests(res.students);
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
					}
				};

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
						self.appliedForAdmission();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.viewAdmissionForm = function(student){
			$('.modal-title').html('Edit Details');
			$('.fd, .hr').removeClass('tabDisabled');
			self.newStudent(new AdmissionModel(student));
			self.newStudent.valueHasMutated();

			selectedLanguages = [];
			$.get('/utils/getLanguages', function(data){
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

		self.populateEnquiryList = function(enquiry) {
			self.enquiryDetails([]);
			var array = self.enquiryDetails();
			$.each(enquiry, function(index, value) {
				array.push(value);
			});

			self.enquiryDetails.valueHasMutated();
		};

		self.getEnquiryList = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/school/getEnquiryList',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateEnquiryList(res.enquiry);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.enquiryDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.openAddEnquiryModal = function(enquiry) {
			self.newEnquiry(new EnquiryModel(enquiry));
			self.newEnquiry.valueHasMutated();
			$('#enquiryModal').modal('show');
		}

		self.validateEnquirySubmission = function(enquiry) {
			if (!enquiry.name()) {
				alert('Enter Name.');
				return false;
			} else if (!enquiry.phone()) {
				alert('Enter Phone No.');
				return false;
			}

			return true;
		}

		self.addEnquiry = function() {
			var enquiry = self.newEnquiry(),
				data = {
					name: enquiry.name(),
					phone: enquiry.phone(),
					email: enquiry.email()
				};

			if (!self.validateEnquirySubmission(enquiry))
				return false;

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/addEnquiry',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.name + ': ' + res.err.message);
					else {
						$('#enquiryModal').modal('hide');
						self.getEnquiryList();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.appliedForAdmission();
			self.getEnquiryList();
		}
	};

	var AdmissionModel = function(student) {
		var self = this;
		self.newOrUpdate = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.status = ko.observable();
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

		if (student) {
			self.newOrUpdate(false);
			self._id(student._id);
			self.name(student.name);
			self.status(student.status);
			self.dob(student.dob);
			self.address(student.address);
			self.phone(student.phone);
			self.languages(student.languages);
			self.family(student.family);
			self.health(student.health);
			self.specialNeed(student.specialNeed);
		}
	};

	var EnquiryModel = function(enquiry) {
		var self = this;
		self.newOrUpdate = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.phone = ko.observable();
		self.email = ko.observable();

		if (enquiry) {
			self.newOrUpdate(false);
			self._id(enquiry._id);
			self.name(enquiry.name);
			self.phone(enquiry.phone);
			self.email(enquiry.email);
		}
	};

	var vm = new AdmissionViewModel();
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
