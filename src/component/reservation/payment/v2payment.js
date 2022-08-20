angular.module('conferenceApp')
    .component('v2payment', {
        templateUrl: 'src/component/reservation/payment/v2payment.htm',
        controller: function paymentController($scope,$rootScope,apiCallout,$error,$cookies,$location,$window,$rootScope,blockUI) {
            if($rootScope.creditCardType && $rootScope.deposit) {
                $scope.creditCardType = $rootScope.creditCardType;
                $scope.deposit = $rootScope.deposit;
            }
            if($rootScope.resort) {
                $scope.resort = $rootScope.resort;
            }
            
            if($rootScope.activeReservationRslt) {
                $scope.activeReservationRslt = angular.copy($rootScope.activeReservationRslt);
            }else {
                $rootScope.resort = null;
                $rootScope.activeReservationRslt =  null;
                $rootScope.creditCardType = null;
                $rootScope.deposit = null;
                $location.path('/home/reservationInfo');
            }
            
            $scope.creditCardNumberDigits = 16;
            $scope.cvvDigits = 3;
            $scope.years = [];
            var  currentYear= new Date().getFullYear();
            $scope.years.push(currentYear);
            for(var index = 1; index < 10 ; index ++){
                $scope.years.push(currentYear + index);
            }
            $scope.months= [];
            var  currentYear= new Date().getFullYear();
            for(var index = 1; index <= 12 ; index ++){
                $scope.months.push(index);
            }
            document.getElementById("Name_on_Credit_Card__c").required = true; 
            document.getElementById("Credit_Card_Type__c").required = true;
            document.getElementById("Credit_Card_Number__c").required = true;
            document.getElementById("expM").required = true;
            document.getElementById("expY").required = true; 
            document.getElementById("CVV").required = true;
            document.getElementById("zipcode").required = true;

            $scope.cancelPayment = function(){
                $scope.errorMessage = null;
                $scope.errorAlert = null;
                $rootScope.resort = null;
                $rootScope.activeReservationRslt =  null;
                $rootScope.creditCardType = null;
                $rootScope.deposit = null
                $location.path('/home/reservationInfo');
            }
            
            $scope.valAndCreateLiveReservation = function(){
                $scope.errorMessage = undefined;
                var currentDate = new Date();
                var currentMonth = currentDate.getMonth()+1;
                var currentYear = currentDate.getFullYear();
                var ccMonth = Number($scope.Credit_Card_Exp_Month__c); 
                var ccYear = Number($scope.Credit_Card_Exp_Year__c); 
                if(ccYear < currentYear || (ccYear === currentYear &&  ccMonth < currentMonth)){
                    $scope.errorMessage = 'The credit card has expired.';
                    return;
                }
                $scope.payment ={
                    'Credit_Card_CVV__c': $scope.Credit_Card_CVV__c,
                    'Credit_Card_Exp_Month__c': $scope.Credit_Card_Exp_Month__c,
                    'Credit_Card_Exp_Year__c': $scope.Credit_Card_Exp_Year__c,
                    'Credit_Card_Number__c': $scope.Credit_Card_Number__c,
                    'Credit_Card_Type__c': $scope.Credit_Card_Type__c,
                    'Amount__c': +$scope.deposit,
                    'Name_on_Credit_Card__c': $scope.Name_on_Credit_Card__c,
                    'Postal_Code__c': $scope.Postal_Code__c,
                    'Resort': $scope.resort
                }
                $scope.temporaryReservation ={};
                for(var index = 0 ;index < $scope.activeReservationRslt.length;index++){
                    var key = Object.keys($scope.activeReservationRslt[index]);
                    $scope.temporaryReservation[key] = $scope.activeReservationRslt[index][key];
                }
                $scope.liveReservationWithDeposit = {
                    'paymentDetails':$scope.payment,
                    'activeReservation': $scope.temporaryReservation
                }
                $rootScope.$broadcast("processing", "Processing Transaction");
                apiCallout.post($scope.liveReservationWithDeposit, '/reservation/collectDeposit', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        $rootScope.$broadcast("stopProcessing");
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $rootScope.$broadcast("stopProcessing"); 
                    $scope.availableUnits= response.data;
                    $error.showSuccess(response.message);
                    $rootScope.resort = null;
                    $rootScope.activeReservationRslt =  null;
                    $rootScope.creditCardType = null;
                    $rootScope.deposit = null
                    $location.path('/home/reservationInfo');
                    $scope.errorMessage = null;
                    $scope.errorAlert = null;
                }, function(response) {
                    $rootScope.$broadcast("stopProcessing");
                    $scope.errorMessage = response.message;
                    return;
                });
            }
            $scope.getCreditCardType = function() { 
                $scope.Credit_Card_Number__c = undefined;
                $scope.Credit_Card_CVV__c = undefined;
                if ($scope.Credit_Card_Type__c == 'American Express') {
                    $scope.creditCardNumberDigits = 15;
                    $scope.cvvDigits = 4;
                } else {
                    $scope.creditCardNumberDigits = 16;
                    $scope.cvvDigits = 3;
                }
            }
        }
    })