var teachers = [],
	selectedCT = [];
$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getClassrooms();
});

function initAndBindViewModel() {

	var ClassroomViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.classroomDetails = ko.observableArray([]);
		self.newClassroom = ko.observable(new ClassroomDataModel());

		self.populateClassrooms = function(classrooms) {
			self.classroomDetails([]);
			var array = self.classroomDetails();
			$.each(classrooms, function(index, value) {
				value['modifiedTime'] = new Date(value['modifiedTime']).toLocaleString();
				value['students'] = value['students'].length;
				array.push(value);
			});
			self.classroomDetails.valueHasMutated();
		};

		self.getClassrooms = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/school/getClassrooms',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateClassrooms(res.classrooms);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.classroomDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.validateSubmission = function(classroom) {
			if (!classroom.name()) {
				alert('Enter Class Name.')
				return false;
			}

			return true;
		}

		self.openAddClassroomModal = function(){
			$('.modal-title').html('Add Classroom');
			$('#update').hide();
			$('#create').show();
			$.get('/school/getTeachers', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					self.newClassroom(new ClassroomDataModel());
					self.newClassroom.valueHasMutated();

					var temp = ''
					data.teachers.forEach(function(t){
						temp += "<option value=" + t._id + ">" + t.name + "</option>";
					})

					$('#subCT').append(temp);
					$('#classTeacher').append(temp);
					$('#classroomModal').modal('show');
				}
			})
		};

		self.addClassroom = function() {
			var classroom = self.newClassroom(),
				data = {
					name: classroom.name(),
					subCT: $('#subCT').val(),
					classTeacher: $('#classTeacher').val()
				};

			if (!self.validateSubmission(classroom))
				return false;

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/addClassroom',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.code + ' ' + res.errmsg);
					else if (res.message == 'Duplicate')
						alert('Classroom already exist');
					else {
						$('#classroomModal').modal('hide');
						self.getClassrooms();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.openEditClassroomModal = function(classroom){
			$('.modal-title').html('Edit Details');
			$('#create').hide();
			$('#update').show();
			$.get('/school/getTeachers', function(data){
				if (data.message == 'error') {
					alert(data.err)
					console.log(data.err)
				} else {
					self.newClassroom(new ClassroomDataModel(classroom));
					self.newClassroom.valueHasMutated();

					var temp = ''
					data.teachers.forEach(function(t){
						temp += "<option value=" + t._id + ">" + t.name + "</option>";
					})
					$('#subCT').append(temp);
					classroom.subCT?$('#subCT option[value=' + classroom.subCT._id + ']').attr('selected', 'selected'):'';

					$('#classTeacher').append(temp);
					$('#classTeacher option[value=' + classroom.classTeacher._id + ']').attr('selected', 'selected');

					$('#classroomModal').modal('show');
				}
			})
		};

		self.updateClassroom = function() {
			var classroom = self.newClassroom(),
				data = {
					_id: classroom._id(),
					name: classroom.name(),
					subCT: $('#subCT').val(),
					classTeacher: $('#classTeacher').val()
				};

			if (!self.validateSubmission(classroom))
				return false;

			Metronic.blockUI();
			$.ajax({
				type: "POST",
				cache: false,
				url: '/school/updateClassroom',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					$('#classroomModal').modal('hide');
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err);
					else
						self.getClassrooms();
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.getClassrooms();
		}
	};

	var ClassroomDataModel = function(classroom) {
		var self = this;
		self.newClassroom = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.subCT = ko.observable();
		self.classTeacher = ko.observable();
		self.modifiedTime = ko.observable();
		self.students = ko.observableArray();
		self.allTeachers = ko.observableArray();

		if (classroom) {
			self.newClassroom(false);
			self._id(classroom._id);
			self.name(classroom.name);
			self.subCT(classroom.subCT);
			self.classTeacher(classroom.classTeacher);
			self.modifiedTime(classroom.modifiedTime);
			self.students(classroom.students);
			self.allTeachers(classroom.allTeachers);
		}
	};
	var vm = new ClassroomViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/school/classrooms');
			break;
		default:
			// default code block
	}
}
