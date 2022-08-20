angular.module('conferenceApp')
    .component('memberInfo', {
        templateUrl: 'src/component/member/memberInfo/memberInfo.htm',
        controller: function memberInfoController($scope, apiCallout, $error,$cookies, $state, utils,$rootScope) {
            $scope.memberInfo = {};
            $scope.updateInfo = {};
            $scope.rvPickList = [];
            $scope.statePlatePickList = [];
            $scope.changePassword = false;
            if(!$rootScope.updateRVInfo){
                $scope.updateRVInfo = false;
            }
            
            $scope.memberUpdatePassword = {};
            $scope.isEmailChange = false;
            $scope.isClick = false;
            var token = $cookies.get('token')
            if (token === undefined || token === null) {
                $state.go('login');
            }

            if($rootScope.updateRVInfo) {
                $scope.updateRVInfo = $rootScope.updateRVInfo;
            }

            $scope.getMemberInfo = function() {
                apiCallout.get('/member').then(function(response) {
                    if (response.success) {
                        $scope.onEdit = true;
                        if(!$rootScope.updateRVInfo){
                            $scope.updateRVInfo = false;
                        }
                        $scope.memberInfo = response.data;
                        $scope.editMemInfo = angular.copy(response.data);
                        return;
                    } else {
                        $scope.onEdit = false;
                        if(!$rootScope.updateRVInfo){
                            $scope.updateRVInfo = false;
                        }
                        $error.showError(response.message);
                        return;
                    }
                }, function(response) {
                    if (response.statusCode === 404 || response.statusCode === 401) {
                        $cookies.remove("token", { path: '/' });
                        $cookies.remove("maxRVDate", { path: '/' });
                        $cookies.remove("depRVShowMax", { path: '/' });
                        $cookies.remove("arrivalShowMax", { path: '/' });
                        $state.go('login');
                    }
                    $scope.onEdit = false;
                    if(!$rootScope.updateRVInfo){
                        $scope.updateRVInfo = false;
                    }
                    $error.showError(response.message);
                    return;
                });
            }
            $scope.getRVInfo = function() {
                var describeObject = {
                    objectName: 'Account',
                    fields: ['State_Vehicle_Plate__c', 'RV_Type__c','RV_Electrical__c']
                }
                apiCallout.post(describeObject, '/metadata/describeObject', { 'token': $cookies.get("token") }).then(function(response) {
                    if (response.success) {
                        if (response.data.length > 0) {
                            $scope.desObj = angular.copy(response.data);
                            $scope.getPickListValues();
                        }
                    } else {
                        $error.showError(response.message);
                        return;
                    }
                }, function(response) {
                    $error.showError(response.message);
                    return;
                });
            }
            $scope.getPickListValues = function() {
                $scope.desObj.forEach(function(objects) {
                    if (objects.Account) {
                        if (objects.Account.RV_Type__c) {
                            if (objects.Account.RV_Type__c.picklistValues) {
                                $scope.rvPickList = objects.Account.RV_Type__c.picklistValues;
                            }
                        }
                        if (objects.Account.State_Vehicle_Plate__c) {
                            if (objects.Account.State_Vehicle_Plate__c.picklistValues) {
                                $scope.statePlatePickList = objects.Account.State_Vehicle_Plate__c.picklistValues;
                            }
                        }
                        if (objects.Account.RV_Electrical__c) {
                            if (objects.Account.RV_Electrical__c.picklistValues) {
                                $scope.rvElectrical = objects.Account.RV_Electrical__c.picklistValues;
                            }
                        }
                    }
                });
            }
            $scope.getMemberInfo();
            $scope.getRVInfo();
            $scope.editMemberInfo = function() {
                $scope.updateInfo = {};
                $scope.onEdit = false;
            }

            $scope.submitMemberInfo = function() {
                if ($scope.updateInfo != undefined && Object.keys($scope.updateInfo).length > 0) {
                    if ($scope.updateInfo.PersonEmail && ($scope.updateInfo.PersonEmail != $scope.editMemInfo.PersonEmail)) {
                        if (confirm('To ensure system security, the owner of the new email address must verify the changes\n\nWhen you click on OK, the email will be sent to the existing email ID with notification of updation and a new email ID will receive the confirmation link.\n\nClick Cancel if you don\'t want to make any changes')) {
                            $scope.updateInfo.Email_From_Change_Request__c = $scope.updateInfo.PersonEmail;
                            delete $scope.updateInfo['PersonEmail'];
                            $rootScope.checkInboxInfo = $scope.updateInfo.Email_From_Change_Request__c;
                            $scope.isEmailChange = true;
                        } else {
                            $scope.updateInfo = {}
                            $scope.memberInfo = angular.copy($scope.editMemInfo);
                        }
                    }
                    if ($scope.updateInfo != undefined && Object.keys($scope.updateInfo).length > 0) {
                        $.each($scope.updateInfo, function(key, value) {
                            if (value === null || value === undefined) {
                                delete $scope.updateInfo[key];
                            }
                        });
                        apiCallout.put($scope.updateInfo, '/member').then(function(response) {
                            if (response.success) {
                                $scope.updateInfo = {};
                                $scope.memberInfo = angular.copy($scope.editMemInfo);
                                $scope.$emit("memberInfo", $scope.memberInfo);
                                if($scope.updateRVInfo === true){
                                    $error.showSuccess(response.message);
                                }
                                else{
                                    if($scope.isEmailChange){
                                        $state.go('home.checkInbox');
                                    }
                                    $error.showInfo('New profile information has been sent for approval. Changes will be reflected once approved.');
                                }
                                $scope.onEdit = true;
                                $scope.updateRVInfo = false;
                                $rootScope.updateRVInfo = false;
                                $scope.getMemberInfo();
                            } else {
                                if ($scope.updateRVInfo === true) {
                                    $scope.onEdit = true;
                                }
                                if ($scope.onEdit === false) {
                                    $scope.updateRVInfo = false;
                                }                               
                                if(response.message.includes("This Email address already exist. Please enter another Email")) { 
                                    if($scope.updateInfo.Email_From_Change_Request__c){
                                        delete $scope.updateInfo['Email_From_Change_Request__c'];
                                        $scope.isEmailChange = false;
                                        $scope.memberInfo.PersonEmail = $scope.editMemInfo.PersonEmail;                                                                                 
                                    }                                              
                                }else{
                                    $scope.updateInfo = {};
                                    $scope.memberInfo = angular.copy($scope.editMemInfo);    
                                }
                                $error.showError(response.message);
                            }
                        }, function(response) {
                            if (response.statusCode === 404 || response.statusCode === 401) {
                                $cookies.remove("token", { path: '/' });
                                $cookies.remove("maxRVDate", { path: '/' });
                                $cookies.remove("depRVShowMax", { path: '/' });
                                $cookies.remove("arrivalShowMax", { path: '/' });
                                $state.go('login');
                            }
                            if(response.message.includes("DUPLICATE_VALUE") && response.message.includes("UserName__c")) {
                                response.message = "This Email address already exist. Please enter another Email.";
                            }
                            $error.showError(response.message);
                            $scope.onEdit = false;
                            $scope.updateInfo = {};
                        });
                    }
                } else {
                    $error.showError("No information to update");
                    return;
                }
            }


            $scope.cancel = function() {
                $scope.memberInfo = angular.copy($scope.editMemInfo);
                $scope.updateInfo = {};
                $scope.onEdit = true;
            }

            $scope.cancelUpdatePassword = function() {
                $scope.memberUpdatePassword = {};
                $scope.changePassword = false;
                $scope.passwordPolicy(false);
            }
           
            $scope.onChangePassword = function() {
                $scope.changePassword = true;
                $scope.memberUpdatePassword = {};
                $scope.errorMessage = '';
                $scope.checkPassword = true;
            }
           
            $scope.onUpdateRVInfo = function() {
                $scope.updateRVInfo = true;
            }
            $scope.cancelRVInfo = function() {
                $scope.updateRVInfo = false;
                $scope.updateInfo = {};
                $rootScope.updateRVInfo = false;
            } 
               
            $scope.passwordPolicy  = function(isClick){
                var password = document.getElementById("member-new-password");
                var symbol = document.getElementById("symbol");
                var capital = document.getElementById("capital");
                var number = document.getElementById("number");
                var length = document.getElementById("length");
                if(isClick)
                    document.getElementById("message").style.display = "block"; 
                password.onfocus = function() {
                    document.getElementById("message").style.display = "block";               
                }        
                password.onkeyup = function() {
                    var symbols = /[!@#$%^&*]/g;
                    if(password.value.match(symbols)) {  
                        symbol.classList.remove("invalid");
                        symbol.classList.add("valid");
                    } else {
                        symbol.classList.remove("valid");
                        symbol.classList.add("invalid");
                    } 
                    var upperCaseLetters = /[A-Z]/g;
                    if(password.value.match(upperCaseLetters)) {  
                        capital.classList.remove("invalid");
                        capital.classList.add("valid");
                    } else {
                        capital.classList.remove("valid");
                        capital.classList.add("invalid");
                    }
                    var numbers = /[0-9]/g;
                    if(password.value.match(numbers)) {  
                        number.classList.remove("invalid");
                        number.classList.add("valid");
                    } else {
                        number.classList.remove("valid");
                        number.classList.add("invalid");
                    }               
                    if(password.value.length >= 8 && password.value.length <= 64) {
                        length.classList.remove("invalid");
                        length.classList.add("valid");
                    } else {
                        length.classList.remove("valid");
                        length.classList.add("invalid");
                    }
                }
            }
            $scope.UpdatePassword = function() {
                var validationResult = this.validations();
                if (validationResult) {
                    $scope.errorMessage = '';
                    $scope.successAlert = null;
                    var validatePassword = utils.validatePassword($scope.memberUpdatePassword.newPassword)
                    if (!validatePassword) {
                        document.getElementById("message").style.display = "block";    
                        return;
                    } else if ($scope.memberUpdatePassword.confirmPassword !== $scope.memberUpdatePassword.newPassword) {
                        return $scope.errorMessage = 'New Password not matches with Confirm Password';
                    }
                    apiCallout.put($scope.memberUpdatePassword, '/member/updatePassword').then(function(response) {
                        if (!response.success) {
                            $scope.errorMessage = response.message;
                        } else {
                            $error.showSuccess(response.message);
                            $scope.changePassword = false;
                        }
                    }, function(response) {
                        $error.showError(response.message);
                    });
                }
            }

            $scope.validations = function() {
                $scope.errorMessage = '';
                if (!$scope.memberUpdatePassword.oldPassword || $scope.memberUpdatePassword.oldPassword === '') {
                    $scope.errorMessage = 'Old password is required.';
                } else if (!$scope.memberUpdatePassword.newPassword || $scope.memberUpdatePassword.newPassword === '') {
                    $scope.errorMessage = 'New password is required.';
                } else if (!$scope.memberUpdatePassword.confirmPassword || $scope.memberUpdatePassword.confirmPassword === '') {
                    $scope.errorMessage = 'Confirm password is required.';
                    document.getElementById("message").style.display = "none";
                } else if ($scope.errorMessage || $scope.errorMessage !== '') {
                    return false;
                } else {
                    return true;
                }
            }
        }
    });