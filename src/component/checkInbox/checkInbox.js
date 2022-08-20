angular.module('conferenceApp')
    .component('checkInbox', {
        templateUrl: 'src/component/checkInbox/checkInbox.htm',
        controller: function checkInboxController($scope,$rootScope) {         
            $scope.emailUpdate =  $rootScope.checkInboxInfo;
            if ($scope.emailUpdate) {
                var start = $scope.emailUpdate.substring(0,2);
                var end = $scope.emailUpdate.slice(-2)
                var middle ='*';
                var emailLength = $scope.emailUpdate.length - 4;
                for(var i = 1 ;i< emailLength;i++ ){
                    middle = middle +'*';
                }
                $scope.username = start + middle + end;
            }           
        }
    });