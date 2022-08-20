angular.module('conferenceApp')
    .component('login', {
        templateUrl: 'src/component/auth/login/login.htm',
        controller: function loginController($scope, apiCallout, $cookies, $error,$location) {
            $scope.request = {}
            var token = $cookies.get('token')
            if (token != undefined || token != null) {
                $location.path('/home/welcome');
            }
            $scope.login = function() {
                $scope.errorMessage = null;
                $scope.dangerAlert = null;
                if (!$scope.Email_id__c) {
                    $scope.errorMessage = 'Please enter your username';
                    return;
                }
                $scope.request.Email_id__c = $scope.Email_id__c;

                if (!$scope.Password__c) {
                    $scope.errorMessage = 'Please enter your password';
                    return;
                }
                $scope.request.Password__c = $scope.Password__c

                apiCallout.post($scope.request, '/auth/login').then(function(response) {
                    if (response.success) {
                        $cookies.put("token", response.data.token, { path: '/' });
                        $error.showSuccess(response.message);
                        $location.path('/home/welcome');
                    } else {
                        if (response.statusCode === 403) {
                            $scope.dangerAlert = response.message;
                            return;
                        }
                        $scope.errorMessage = response.message;
                        return;
                    }
                }, function(response) {
                    if (response.statusCode === 403) {
                        $scope.dangerAlert = response.message;
                        return;
                    }
                    $scope.errorMessage = response.message;
                    return;
                });
            }
        }
    });