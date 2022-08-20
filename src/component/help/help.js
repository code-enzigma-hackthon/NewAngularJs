angular.module('conferenceApp')
    .component('help', {
        templateUrl: 'src/component/help/help.htm',
        controller: function helpController($scope) {    
            $scope.todaysDate = new Date();
            $scope.year = $scope.todaysDate.getFullYear();     
        }
    });