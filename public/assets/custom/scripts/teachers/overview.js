var teachersApp = angular.module("teachersApp", []);
teachersApp.controller("teachersController", function($scope, $http) {
    $scope.students = [];
    $scope.classrooms = classrooms;
    $scope.currentClassroom = $scope.classrooms[0];

    function setCurrentClassroom() {
        for (let cl = 0; cl < $scope.classrooms.length; cl++) {
            if ($scope.classrooms[cl]._id == currentClassroomId) {
                $scope.currentClassroom = $scope.classrooms[cl];
                break;
            }
        }
    };

    $http({
        method: "GET",
        url: "/teachers/getClassrooms",
    }).then(function(res) {
        $scope.classrooms = res.data;
        setCurrentClassroom();
        $scope.getStudents();
    });

    $scope.getStudents = function() {
        $http({
            method: "GET",
            url: "/teachers/students",
            params: {classroom: $scope.currentClassroom._id}
        }).then(function(res) {
            $scope.students = res.data;
            window.history.replaceState({
                classroom: $scope.currentClassroom._id
            }, null, window.location.pathname + "?classroom=" + $scope.currentClassroom._id);
        }, function(error) {
            console.log("Error fetching students: " + error);
        });
    };

    $scope.clearSearch = function() {
        $scope.searchText = "";
    };
});

$("a").click(function() {
    $.blockUI({message: "Loading..."});
});
