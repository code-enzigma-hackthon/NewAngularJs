angular.module('conferenceApp')
    .component('register', {

        templateUrl: 'src/component/member/register/register.htm',
        controller: function registerController($scope, $cookies, $state, $location, $error, utils, apiCallout, $window) {
            $scope.messageWithLink = false;
            $scope.valLinkExpire = false;
            var password = document.getElementById("new-password");
            var symbol = document.getElementById("symbol");
            var capital = document.getElementById("capital");
            var number = document.getElementById("number");
            var length = document.getElementById("length");
            $scope.messageWithLink = false;
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
                $scope.PersonEmail = urlString["username"];
            }
            $scope.personEmailDisabled = true;

            $scope.register = function() {
                $scope.errorMessage = null;
                $scope.successMessage = null;
                if ($scope.newPassword === '' || !$scope.newPassword) {
                    $scope.errorMessage = "Please enter your password";
                    document.getElementById("message").style.display = "none";
                    return;
                };
                var validatePassword = utils.validatePassword($scope.newPassword)
                if (!validatePassword) {
                    document.getElementById("message").style.display = "block";
                    return;
                }
                if ($scope.confirmPassword === '' || !$scope.confirmPassword) {
                    $scope.errorMessage = "Please enter confirm password";
                    document.getElementById("message").style.display = "none";
                    return;
                };
                if ($scope.newPassword !== $scope.confirmPassword) {
                    $scope.errorMessage = "New password does not matches with Confirm password";
                    document.getElementById("message").style.display = "none";
                    return;
                };
                
                $scope.requestBody = {
                    verificationToken: $scope.verificationToken,
                    Password__c: $scope.newPassword
                }
                apiCallout.post($scope.requestBody, '/member/register').then(function(response) {
                    if (!response.success) {
                        if(response.message === 'You have already register for member portal.') {
                            $scope.messageWithLink = true;
                        }
                        if(response.message === 'The validation link has expired.') {
                            $scope.valLinkExpire = true;
                        }
                        $scope.errorMessage = response.message;
                        return;
                    } else {
                        $cookies.put("token", response.data.token, { path: '/' });
                        $error.showSuccess(response.message);
                        $location.path('/home/welcome/');
                        return;
                    }
                }, function(response) {
                    if(response.message === 'Token has expired') {
                        response.message = 'The validation link has expired.';
                        $scope.valLinkExpire = true;
                    }
                    return $scope.errorMessage = response.message;
                });
            };

            $scope.loginPage = function(){
                $cookies.remove("token", { path: '/' });
                $state.go('login');
            }
            $scope.joinPage = function(){
                $cookies.remove("token", { path: '/' });
                $state.go('verifyEmail');
            }
        }
    });