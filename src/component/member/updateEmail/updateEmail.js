angular.module('conferenceApp')
    .component('updateEmail', {

        templateUrl: 'src/component/member/updateEmail/updateEmail.htm',
        controller: function updateEmailController($scope, apiCallout, $cookies, $window, $state) {
            // split url and put it in a array
            $scope.errorMessage = null;
            var urlString = new Array();
            if ($window.location.hash.split('?').length > 1) {
                var params = $window.location.hash.split('?')[1].split('&');
                for (var i = 0; i < params.length; i++) {
                    var key = params[i].split('=')[0];
                    var value = decodeURIComponent(params[i].split('=')[1]);
                    urlString[key] = value;
                }
            }
            //set url string vairables to scope vairable
            if (urlString["Id"] && urlString["Id"] !== undefined && urlString["Id"] !== null) {
                $scope.Id = urlString["Id"];
            } else {
                $scope.errorMessage = 'Invalid Email Id reset link'
                return;
            }
            if (urlString["Email_From_Change_Request__c"] && urlString["Email_From_Change_Request__c"] !== undefined && urlString["Email_From_Change_Request__c"] !== null) {
                $scope.Email_From_Change_Request__c = urlString["Email_From_Change_Request__c"];
            } else {
                $scope.errorMessage = 'Invalid Email Id reset link'
                return;
            }
            $scope.requestBody = {
                Id: $scope.Id,
                Email_From_Change_Request__c: $scope.Email_From_Change_Request__c
            }
            $scope.updateEmail = function() {
                apiCallout.put($scope.requestBody, '/member/updateEmail').then(function(response) {
                    if (!response.success) {
                        $scope.errorMessage = response.message;
                        return;
                    } else {
                        $cookies.remove("token", { path: '/' });
                        $cookies.remove("maxRVDate", { path: '/' });
                        $cookies.remove("depRVShowMax", { path: '/' });
                        $cookies.remove("arrivalShowMax", { path: '/' });
                        $scope.infoMessage = 'Member Email and Username has been updated successfully. Please click on continue for login ';
                        $scope.successMessage = $scope.infoMessage;
                        return;
                    }
                }, function(response) {
                    $scope.errorMessage = response.message;
                });
            }

            $scope.continueToLogin = function() {
                $state.go('login');
            }
            $scope.updateEmail();
        }
    });