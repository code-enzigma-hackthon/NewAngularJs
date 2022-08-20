angular.module('conferenceApp')
    .component('forgotPassword', {

        templateUrl: 'src/component/member/forgotPassword/forgotPassword.htm',
        controller: function forgotPasswordController($scope, $error, apiCallout) {
            $scope.request = {};
            $scope.forgotPassword = function() {
                $scope.errorMessage = null;
                $scope.dangerAlert = null;
                $scope.success = false;
                if (!$scope.PersonEmail) {
                    $scope.errorMessage = "Please enter username!";
                    return;
                }
                $scope.request.PersonEmail = $scope.PersonEmail;

                apiCallout.put($scope.request, '/member/forgotPassword').then(function(response) {
                    if (!response.success) {
                        if (response.statusCode === 403) {
                            $scope.dangerAlert = response.message;
                            return;
                        }
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $error.showSuccess(response.message);
                    $scope.success = true;
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