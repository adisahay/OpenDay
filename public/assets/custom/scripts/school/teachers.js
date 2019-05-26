var classrooms = [],
	selectedCR = [];

function findIndexInData(data, property, value) {
	for(var i = 0, l = data.length ; i < l ; i++) {
		if(data[i][property] == value) {
			return i;
		}
	}
	return -1;
}

$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getTeachers();
});

function initAndBindViewModel() {

	var TeacherViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.teacherDetails = ko.observableArray([]);
		self.newTeacher = ko.observable(new TeacherDataModel());

		self.populateTeachers = function(teachers) {
			self.teacherDetails([]);
			var array = self.teacherDetails();
			$.each(teachers, function(index, value) {
				value['email'] = value['email'];
				var classlist = '';
				value['classrooms'].forEach(function(c, k){
					if (k == value['classrooms'].length - 1)
						classlist += c.name;
					else
						classlist += c.name + ', ';
				})
				value['classlist'] = classlist;
				value['classrooms'] = value['classrooms'];
				array.push(value);
			});
			self.teacherDetails.valueHasMutated();
		};

		self.getTeachers = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/school/getTeachers',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateTeachers(res.teachers);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.teacherDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.openAddTeacherModal = function(teacher){
			$('.modal-title').html('Add Teacher');
			$('#update').hide();
			$('#create').show();
			self.newTeacher(new TeacherDataModel(teacher));
			self.newTeacher.valueHasMutated();

			selectedCR = [];
			$.get('/school/getClassrooms', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					var temp = '';
					classrooms = data.classrooms;
					classrooms.forEach(function(c){
						temp += "<option value=" + c._id + ">" + c.name + "</option>";
					})
					$('#classSelect').append(temp);
					$('#classSelect').multiselect({
						nonSelectedText: 'None',
						numberDisplayed: 4,
						nSelectedText: 'Classes Selected',
						buttonWidth: '100%',
						onChange: function(option, checked) {
							if (checked)
								selectedCR.push(option[0].value);
							else
								selectedCR.splice(selectedCR.indexOf(option[0].value), 1);
						}
					});
					$('#teacherModal').modal('show');
				}
			})
		};

		self.validateSubmission = function(teacher) {
			if (!teacher.name()) {
				alert('Enter Teacher Name.')
				return false;
			} else if (!teacher.username()) {
				alert('Enter Mobile Number');
				return false;
			}/* else if (!teacher.password()) {
				alert('Enter Password');
				return false;
			}*/

			return true;
		}

		self.addTeacher = function() {
			var teacher = self.newTeacher(),
				data = {
					name: teacher.name(),
					username: teacher.username(),
					email: teacher.email(),
					password: teacher.password(),
					classrooms: selectedCR,
				};

			if (!self.validateSubmission(teacher))
				return false;

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/addTeacher',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.name + ': ' + res.err.message);
					else if (res.message == 'Duplicate')
						alert('Teacher already exist');
					else {
						$('#teacherModal').modal('hide');
						self.getTeachers();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.openEditTeacherModal = function(teacher){
			$('.modal-title').html('Edit Details');
			$('#create').hide();
			$('#update').show();
			self.newTeacher(new TeacherDataModel(teacher));
			self.newTeacher.valueHasMutated();

			selectedCR = [];
			$.get('/school/getClassrooms', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					var temp = '';
					classrooms = data.classrooms;
					classrooms.forEach(function(c){
						if (findIndexInData(teacher.classrooms, '_id', c._id) > -1) {
							temp += "<option selected value=" + c._id + ">" + c.name + "</option>";
							selectedCR.push(c._id);
						} else
							temp += "<option value=" + c._id + ">" + c.name + "</option>";
					})
					$('#classSelect').append(temp);
					$('#classSelect').multiselect({
						nonSelectedText: 'None',
						numberDisplayed: 2,
						nSelectedText: 'Classes Selected',
						buttonWidth: '100%',
						onChange: function(option, checked) {
							if (checked)
								selectedCR.push(option[0].value);
							else
								selectedCR.splice(selectedCR.indexOf(option[0].value), 1);
						}
					});
					$('#teacherModal').modal('show');
					$('.password').hide();
				}
			})
		};

		self.updateTeacher = function() {
			var teacher = self.newTeacher(),
				data = {
					_id: teacher._id(),
					name: teacher.name(),
					username: teacher.username(),
					email: teacher.email(),
					classrooms: selectedCR,
				};

			if (!self.validateSubmission(teacher))
				return false;

			Metronic.blockUI();
			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/updateTeacher',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error') {
						console.log(res.err);
						alert(res.err);
					} else {
						$('#teacherModal').modal('hide');
						self.getTeachers();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.getTeachers();
		}
	};


	/* Knockout data model for Teacher */
	function TeacherDataModel(teacher) {
		var self = this;
		self.newTeacher = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable().extend({required: true});
		self.username = ko.observable().extend({required: true});
		self.password = ko.observable().extend({required: true});
		self.email = ko.observable();
		self.classrooms = ko.observableArray();

		if (teacher) {
			self.newTeacher(false);
			self._id(teacher._id);
			self.name(teacher.name);
			self.username(teacher.username);
			self.password(teacher.password);
			self.email(teacher.email);
			self.classrooms(teacher.classrooms);
		}
	};
	var vm = new TeacherViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/school/teachers');
			break;
		default:
			// default code block
	}
}
