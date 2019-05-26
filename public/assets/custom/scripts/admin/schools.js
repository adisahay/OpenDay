$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getSchools();
});

function initAndBindViewModel() {

	var SchoolViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.schoolDetails = ko.observableArray([]);
		self.newSchool = ko.observable(new SchoolDataModel());

		self.populateSchools = function(schools) {
			console.log(schools)
			self.schoolDetails([]);
			var array = self.schoolDetails();
			$.each(schools, function(index, value) {
				array.push(value);
			});
			self.schoolDetails.valueHasMutated();
		};

		self.getSchools = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/admin/getSchools',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateSchools(res.schools);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.schoolDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.openAddModal = function(){
			$('.modal-title').html('Add School');
			self.newSchool(new SchoolDataModel());
			self.newSchool.valueHasMutated();
			$('#schoolModal').modal('show');
		};

		self.validateSubmission = function(school) {
			if (!school.name()) {
				alert('Enter School Name.')
				return false;
			} else if (!school.username()) {
				alert('Enter Username Number');
				return false;
			}

			return true;
		}

		self.addSchool = function() {
			var school = self.newSchool(),
				data = {
					name: school.name(),
					username: school.username(),
					password: school.password(),
					city: school.address.city
				};

			if (!self.validateSubmission(school))
				return false;

			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/admin/addSchool',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.name + ': ' + res.err.message);
					else {
						$('#schoolModal').modal('hide');
						self.getSchools();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.getSchools();
		}
	};

	var SchoolDataModel = function(school) {
		var self = this;
		self.newSchool = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.address = ko.observable();
		self.username = ko.observable();
		self.password = ko.observable().extend({required: true});

		if (school) {
			self.newSchool(false);
			self._id(school._id);
			self.name(school.name);
			self.address(school.address);
			self.username(school.username);
			self.password(school.password);
		}
	};
	var vm = new SchoolViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/admin/schools');
			break;
		default:
			// default code block
	}
}
