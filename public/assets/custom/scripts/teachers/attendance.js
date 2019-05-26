var calendarVisible = false;

function changeArrow() {
    if (!calendarVisible) {
        $("#calendarButton").removeClass("fa-angle-right");
        $("#calendarButton").addClass("fa-angle-down");
    } else {
        $("#calendarButton").removeClass("fa-angle-down");
        $("#calendarButton").addClass("fa-angle-right");
    }
    calendarVisible ^= true;
}

var attendanceApp = angular.module("attendanceApp", []);
attendanceApp.controller("attendanceController", function($scope, $http) {
    $scope.students = [];
    $scope.selectedDate = new Date();

    $("#calendar").datepicker({
        todayHighlight: true
    }).on("changeDate", function(ev) {
        $("#datePicker").click(); // Close the calendar
        $scope.$apply(function() {
            $scope.selectedDate = new Date(ev.date);
        });
        getAttendance();
    });

    function getAttendance() {
        $http({
            method: "GET",
            url: "/teachers/getAttendance",
            params: {
                date: $scope.selectedDate,
                classroom: classroom
            }
        }).then(function(attendance) {
            if (attendance.data.records)
                applyAttendance(attendance.data.records);
            else
                clearAttendance();
        }, function(error) {
            console.log("Error fetching students: " + error);
        });
    };

    $http({
        method: "GET",
        url: "/teachers/students",
        params: {classroom: classroom}
    }).then(function(students) {
        $scope.students = students.data;
        getAttendance();
    }, function(error) {
        console.log("Error fetching students: " + error);
    });

    function applyAttendance(records) {
        for (let st = 0; st < $scope.students.length; st++)
            for (let rec = 0; rec < records.length; rec++)
                if ($scope.students[st]._id == records[rec].student)
                    $scope.students[st].absent = records[rec].absent;
    };

    function clearAttendance() {
        for (let stud = 0; stud < $scope.students.length; stud++)
            $scope.students[stud].absent = undefined;
    };

    $scope.clearSearch = function() {
        $scope.searchText = "";
    };

    $scope.toggleAbsentee = function(index) {
        $scope.studs[index].absent ^= true;
    };

    $scope.submitAttendance = function() {
        $http({
            method: "POST",
            url: "/teachers/saveAttendance",
            params: {
                classroom: classroom,
                attendance: JSON.stringify($scope.students),
                date: $scope.selectedDate
            }
        }).then(function(res) {
            if (res.data.status == 200) {
                getAttendance();
                if ($scope.absentees.length == 0) {
                    showPopUp("Attendance saved", "The attendance for the class has been saved successfully.", function() {
                        window.history.back();
                    });
                } else {
                    var message = "Do you wish to notify " + $scope.absentees.length + " parent(s) regarding the absence?";
                    showPopUp("Attendance saved", message, null, function(approved) {
                        if (approved) {
                            hidePopUp();
                            var absentees = [];
                            for (let ab = 0; ab < $scope.absentees.length; ab++)
                                absentees.push($scope.absentees[ab]._id)
                            $http({
                                method: "POST",
                                url: "/teachers/notifyAbsents",
                                data: {
                                    absentees: absentees,
                                    subject: "Absence of your ward",
                                    text: "Dear parent,\n\nThis is to notify that your ward did not attend school on " + $scope.selectedDate + ".\nKindly provide a leave note if not done so already.\n\nRegards"
                                }
                            }).then(function(res) {
                                showPopUp("Notification sent", "Parents, who have provided their email addresses, will be notified shortly.", function() {
                                    window.history.back();
                                });
                            });
                        } else {
                            window.history.back();
                        }
                    });
                }
            }
            else
                showPopUp("Something went wrong", "Please contact the administrator.");
        });
    };

    $scope.isAbsent = function(student) {
        return student.absent == true;
    };

    $scope.goBack = function() {
        window.history.back();
    };
});
