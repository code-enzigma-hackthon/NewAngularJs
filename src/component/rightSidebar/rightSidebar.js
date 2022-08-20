angular.module('conferenceApp')
    .component('rightSidebar', {

        templateUrl: 'src/component/rightSidebar/rightSidebar.htm',
        controller: function rightSidebarController($scope, $error, apiCallout, blockUI, $cookies, $state, $location) {
            $scope.memberInfo = {};
            $scope.getActiveReservations = function() {
                $scope.errorMessage = null;
                $scope.successMessage = null;
                apiCallout.get('/reservation/history').then(function(response) {
                    if (!response.success) {
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $scope.activeReservations = [];
                    angular.forEach(response.data.reservations, function(record) {
                        if (record.Reservation_Status__c == "Active") {
                            $scope.activeReservations.push(record);
                        }
                    });
                    if (!$scope.activeReservations.length) {
                        $scope.successMessage = "No Active Reservation found";
                        return;
                    }
                }, function(response) {
                    $scope.errorMessage = response.message;
                    return
                });
            }
            $scope.getMemberInfo = function() {
                apiCallout.get('/member').then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $error.showError(response.message);
                        return;
                    }
                    $scope.memberInfo = response.data 
                }, function(response) {
                    blockUI.stop();
                    $error.showError(response.message);
                    return;
                });
            }
            var token = $cookies.get('token')
            if (token === undefined || token === null) {
                $state.go('/login');
            } else {
                $scope.getActiveReservations();
                $scope.getMemberInfo();
            }

            $scope.activeReservation = function() {
                $location.path('/home/activeReservation');
            }

            $scope.requestReservation = function() {
                    $location.path('/home/requestReservation');
            }            
        }

    });