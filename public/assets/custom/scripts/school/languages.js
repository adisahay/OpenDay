$(document).ready(function() {
	var vm = initAndBindViewModel();
	vm.getLanguages();
});

function initAndBindViewModel() {

	var LanguageViewModel = function() {
		var self = this;
		self.isEditMode = ko.observable(false);
		self.currentEditIndex = -1;
		self.objectId = "";
		self.languageDetails = ko.observableArray([]);
		self.newLanguage = ko.observable(new LanguageDataModel());

		self.populateLanguages = function(languages) {
			self.languageDetails([]);
			var array = self.languageDetails();
			$.each(languages, function(index, value) {
				array.push(value);
			});
			self.languageDetails.valueHasMutated();
		};

		self.getLanguages = function() {
			Metronic.blockUI({
				target: '#blockui_portlet_body',
				boxed: true
			});

			$.ajax({
				type: "GET",
				cache: false,
				url: '/admin/getLanguages',
				dataType: "json",
				success: function(res){
					Metronic.unblockUI();
					if(res.message == 'success')
						self.populateLanguages(res.languages);
					else if (res.message == 'error')
						alert('Error: ' + res.err);
					else
						self.languageDetails([]);
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		};

		self.openAddModal = function(){
			$('.modal-title').html('Add Language');
			$('#update').hide();
			$('#create').show();
			self.newLanguage(new LanguageDataModel());
			self.newLanguage.valueHasMutated();
			$('#languageModal').modal('show');
		};

		self.addLanguage = function() {
			var language = self.newLanguage(),
				data = {
					name: language.name(),
					shortForm: language.shortForm()
				};

			if (!language.name())
				return;
			Metronic.blockUI();

			$.ajax({
				type: "POST",
				cache: false,
				url: '/admin/addLanguage',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err.code + ' ' + res.errmsg);
					else if (res.message == 'Duplicate')
						alert('Language already exist');
					else {
						$('#languageModal').modal('hide');
						self.getLanguages();
					}
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.openEditModal = function(language){
			$('.modal-title').html('Edit Details');
			$('#create').hide();
			$('#update').show();
			self.newLanguage(new LanguageDataModel(language));
			self.newLanguage.valueHasMutated();
			$('#languageModal').modal('show');
		};

		self.updateLanguage = function() {
			var language = self.newLanguage(),
				data = {
					_id: language._id(),
					name: language.name(),
					shortForm: language.shortForm()
				};

			Metronic.blockUI();
			$.ajax({
				type: "POST",
				cache: false,
				url: '/admin/updateLanguage',
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(res){
					$('#languageModal').modal('hide');
					Metronic.unblockUI();
					if (res.message == 'error')
						alert(res.err);
					else
						self.getLanguages();
				},
				error: function(){
					Metronic.unblockUI();
					onHandleErrorFromServer(xhr);
				}
			});
		}

		self.reload = function() {
			self.getLanguages();
		}
	};

	var LanguageDataModel = function(language) {
		var self = this;
		self.newLanguage = ko.observable(true);
		self._id = ko.observable();
		self.name = ko.observable();
		self.shortForm = ko.observable();

		if (language) {
			self.newLanguage(false);
			self._id(language._id);
			self.name(language.name);
			self.shortForm(language.shortForm);
		}
	};
	var vm = new LanguageViewModel();
	ko.applyBindings(vm);
	return vm;
}

function onHandleErrorFromServer(xhr) {
	console.log(xhr.statusText);
	switch(xhr.status) {
		case 401:
			window.location.replace('/admin/languages');
			break;
		default:
			// default code block
	}
}
