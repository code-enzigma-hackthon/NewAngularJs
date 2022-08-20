angular.module('conferenceApp')
    .component('resetPassword', {

        templateUrl: 'src/component/member/resetPassword/resetPassword.htm',
        controller: function resetPasswordController($scope, apiCallout, $error, utils, $window, $cookies, $location) {
            var password = document.getElementById("new-password");
            var symbol = document.getElementById("symbol");
            var capital = document.getElementById("capital");
            var number = document.getElementById("number");
            var length = document.getElementById("length");
            password.onfocus = function() {
                $scope.errorMessage = null;
                $scope.$apply();
                document.getElementById("message").style.display = "block";               
            }
            password.onblur = function() {
                document.getElementById("message").style.display = "none";
            }             
            password.onkeyup = function() {
                // Validate lowercase letters
                var symbols = /[!@#$%^&*]/g;
                if(password.value.match(symbols)) {  
                    symbol.classList.remove("invalid");
                    symbol.classList.add("valid");
                } else {
                    symbol.classList.remove("valid");
                    symbol.classList.add("invalid");
                }                
                // Validate capital letters
                var upperCaseLetters = /[A-Z]/g;
                if(password.value.match(upperCaseLetters)) {  
                    capital.classList.remove("invalid");
                    capital.classList.add("valid");
                } else {
                    capital.classList.remove("valid");
                    capital.classList.add("invalid");
                }
                // Validate numbers
                var numbers = /[0-9]/g;
                if(password.value.match(numbers)) {  
                    number.classList.remove("invalid");
                    number.classList.add("valid");
                } else {
                    number.classList.remove("valid");
                    number.classList.add("invalid");
                }                
                // Validate length
                if(password.value.length >= 8 && password.value.length <= 64) {
                    length.classList.remove("invalid");
                    length.classList.add("valid");
                } else {
                    length.classList.remove("valid");
                    length.classList.add("invalid");
                }
            }
            // split url and put it in a array
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
            if (urlString["token"] !== null) {
                $scope.verificationToken = urlString["token"];
            }
            if (urlString["username"] !== null) {
                $scope.UserName__c = urlString["username"];
            }
            $scope.personEmailDisabled = true;

            $scope.resetPassword = function() {
                $scope.errorMessage = null;
                if (!$scope.UserName__c) {
                    $scope.errorMessage = "Please enter username";
                    document.getElementById("message").style.display = "none";
                    return;
                };
                if (!$scope.Password__c) {
                   $scope.errorMessage = "Please enter your password";
                   document.getElementById("message").style.display = "none";
                    return;
                };
                var validatePassword = utils.validatePassword($scope.Password__c)
                if (!validatePassword) {
                    document.getElementById("message").style.display = "block";
                    return;
                }
                if (!$scope.confirmPassword) {
                    $scope.errorMessage = "Please enter confirm password";
                    document.getElementById("message").style.display = "none";
                    return;
                };
                if ($scope.Password__c !== $scope.confirmPassword) {
                    $scope.errorMessage = "New Password does not matches with Confirm Password";
                    document.getElementById("message").style.display = "none";
                    return;
                };
               
                $scope.requestBody = {
                    verificationToken: $scope.verificationToken,
                    UserName__c: $scope.UserName__c,
                    Password__c: $scope.Password__c
                }
                apiCallout.put($scope.requestBody, '/member/resetPassword').then(function(response) {
                    if (!response.success) {
                        $scope.errorMessage = response.message;
                        return;
                    } else {
                        $cookies.put("token", response.data.token, { path: '/' });
                        $error.showSuccess("Member password updated successfully!.");
                        $location.path('/home/welcome/');
                        return;
                    }

                }, function(response) {
                    $scope.errorMessage = response.message;                   
                    document.getElementById("message").style.display = "none";
                    return;
                });
            };
        }
    });