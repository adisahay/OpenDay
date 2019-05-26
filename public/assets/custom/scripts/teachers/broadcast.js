var broadcastApp = angular.module("broadcastApp", []);
var fileDetails = [];

$("#attachFiles").change(function() {
    $.blockUI({
        message: '<h1>Processing attachment. Hang tight...</h1>',
        css: {border: 'none', color: '#7a7a7a', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', 'border-radius': '10px'}
    });
    var filesSelected = document.getElementById("attachFiles").files;
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
            $('#attachmentList').append('<div class="attachments" id="' + index +
                '"><i class="fa fa-paperclip"></i>&nbsp;&nbsp;' +
                targetFile.name + '&nbsp;&nbsp;&nbsp;' +
                formatBytes(fileToLoad.size, 2) +
                '&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash" style="cursor: pointer;" onclick="deleteAttachment(' + index + ');"></i></div>');
            $.unblockUI();
            $("#attachFiles").val("");
        };
        fileReader.readAsDataURL(fileToLoad);
    }
});

function deleteAttachment(index) {
    $('#' + index).remove();
    fileDetails.splice(index, 1);
}

function formatBytes(bytes,decimals) {
    if(bytes == 0) return '0 Byte';
    var k = 1024,
        dm = decimals + 1 || 3,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
}

broadcastApp.controller("broadcastController", function($scope, $http) {
    $scope.students = students;
    $scope.fileDetails = [];
    $scope.broadcastEmail = function() {
        if (!$scope.subjectText || $scope.subjectText.trim() == "") {
            showPopUp("Subject missing", "Please provide a Subject.");
            return;
        } else if (!$scope.bodyText || $scope.bodyText.trim() == "") {
            showPopUp("Body is empty", "Please write something in the mail body.");
            return;
        }

        $http({
            method: "POST",
            url: "/teachers/broadcastEmail",
            data: {
                classroom: classroom,
                subject: $scope.subjectText,
                text: $scope.bodyText,
                attachment: JSON.stringify(fileDetails)
            }
        }).then(function(res) {
            showPopUp("Broadcast emails sent", "Parents, who have provided their email addresses, will be notified shortly.", function() {
                window.history.back();
            });
        });
    };

    $scope.goBack = function() {
        window.history.back();
    };
});

broadcastApp.directive('fileInput', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.bind('change', function () {
                $parse(attributes.fileInput)
                .assign(scope, element[0].files)
                scope.$apply()
            });
        }
    };
}]);
